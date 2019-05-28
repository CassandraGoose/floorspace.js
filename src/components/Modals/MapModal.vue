<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<aside>
    <div class="floorspace-overlay"></div>
    <div id="speed-modal" class="floorspace-modal" :style="modal">
        <header>
            <h2>Start</h2>
        </header>
        <NonChromeWarning />
        <div class="content">
            <p>
              <a @click="mapEnabled = true; tool='Map'; $emit('close')" :disabled="!online" class="quickstart-action">
                <div class="title">Create a new floorplan with a map</div>
                <QuickstartIconNewMapFloorplan />
                <!-- <div class="explanation">Create a new floorplan with a map</div> -->
              </a>
            </p>
            <div v-if="currentFootprint !== 1" id="copyExisting">
              <a :disabled="!online" class="quickstart-action">
                <div class="title">Create a copy of existing floorplan</div>
                <QuickstartIconNewFloorplan />
                <div id="arrow-holder"> <speed-arrow id="arrow" /></div>
                <QuickstartIconNewFloorplan />
              </a>
              <div v-if="currentFootprint !== 1" class="select-footprint" id="select-container">
                <div @click="selectToggle = true" v-if="!selectToggle" id="list-container" class="start-select">
                  <div>
                    <p>{{availableFootprints[0]}}</p> <p>▼</p>
                  </div>
                </div>
                  <div v-if="selectToggle" id="list-container" title="Select footprint to copy">
                    <ol v-for="(footprint, i) in this.availableFootprints" :key="i">
                      <li @click="copyFootprint(i)">{{footprint}}</li>
                    </ol>
                  </div>
              </div>

            </div>

            <!-- FLOORSPACE CHANGE BELOW -->

            <!-- <p>
              <a @click="mapEnabled = false; mapVisible = false; $emit('close')" class="quickstart-action new-floorplan">
                <div class="title">Create a new floorplan</div>
                <QuickstartIconNewFloorplan /> -->
                <!-- <div class="explanation">Create a new floorplan</div> -->
              <!-- </a>
            </p> -->
            <!-- <p>
              <a @click="$refs.importInput.click()" id="import" class="quickstart-action open-floorplan">
                <div class="title">Open</div>
                <QuickstartIconOpenFloorplan />
                <div class="explanation">Open an existing floorplan</div>
              </a>
            </p> -->
            <input id="importInput" ref="importInput" @change="importFloorplanAsFile" type="file"/>
        </div>
    </div>
</aside>
</template>

<script>
import { mapState } from 'vuex';
import svgs from '../svgs';
import NonChromeWarning from '../NonChromeWarning.vue';

export default {
  name: 'MapModal',
  props: ['modal'],
  data() {
    return {
      address: '',
      selectToggle: false,
      currentFootprint: 1,
      availableFootprints: [],
      underscoreFootprints: [],
    };
  },
  created() {
    if (this.$root.$options.eventBus.currentFootPrintShape) {
      this.currentFootprint = this.$root.$options.eventBus.currentFootPrintShape;
      this.setAvailableFootprints(this.$root.$options.eventBus.allFloorspacesData);
    } else {
      this.$root.$options.eventBus.$on('currentFootPrintShape', (data) => {
        this.currentFootprint = data;
      });
    }
    this.$root.$options.eventBus.$on('loadOldData', (data) => {
      this.importFloorplan(data);
    });
  },
  computed: {
    ...mapState({
      svgGridId: state => state.application.currentSvgGridId,
    }),
    online() { return window.api && window.api.config ? window.api.config.online : true; },
    mapEnabled: {
      get() { return this.$store.state.project.map.enabled; },
      set(enabled) {
        this.$store.dispatch('project/setMapEnabled', { enabled });
      },
    },
    tool: {
      get() { return this.$store.state.application.currentSelections.tool; },
      set(val) { this.$store.dispatch('application/setCurrentTool', { tool: val }); },
    },
  },
  methods: {
    setAvailableFootprints(alldata) {
      this.underscoreFootprints = alldata.map(object => Object.keys(object)[0]);
      this.availableFootprints = this.underscoreFootprints.map(footprint => footprint.replace(/_/g, ' '));
    },
    copyFootprint(i) {
      const selectedFootprint = this.underscoreFootprints[i];
      this.mapEnabled = true;
      this.tool = 'Map';
      console.log('alldata', this.$root.$options.eventBus.allFloorspacesData);
      console.log('selectedfootprint', this.underscoreFootprints[i]);
      const data = this.$root.$options.eventBus.allFloorspacesData.find((object) => {
        console.log('single object in loop', object);
        console.log('in loop all', object[selectedFootprint]);
        return object[selectedFootprint];
      });
      console.log('eventbusdata.find object[selectedfootprint]', data);
      this.fixThermalZones(data[selectedFootprint]);
      this.$nextTick(() => {
        this.importFloorplan(data[selectedFootprint]);
      });
      this.$emit('close');
    },
    fixThermalZones(data) {
      data.stories.forEach((story) => {
        story.spaces.forEach((space) => {
          space.thermal_zone_id = space.thermal_zone_id.id;
        });
      });
    },
    importFloorplanAsFile(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.importFloorplan(reader.result);
      }, false);

      if (file) { reader.readAsText(file); }
    },
    importFloorplan(data) {
      this.$store.dispatch('importFloorplan', {
        clientWidth: document.getElementById(this.svgGridId).clientWidth,
        clientHeight: document.getElementById(this.svgGridId).clientHeight,
        data,
      });
    },
  },
  components: {
    ...svgs,
    NonChromeWarning,
  },
};
</script>

<style lang="scss" scoped>
@import "./../../scss/config";
@import "./../../scss/main.scss";

.floorspace-modal {
    font-family: 'Open Sans', sans-serif;
    width: 35rem;
    background: #CCCCCC;
    header h2 {
      font-weight: bold;
    }

    .content {
        margin: 0 2rem 2rem 2rem;
        text-align: center;
        display: flex;
        justify-content: center;

        button {
            margin: 1rem .5rem;
        }

        input[type=file] {
            display: none;
        }
        .explanation {
          color: #5D5D5D;
        }
        .title {
          color: #5D5D5D;
          text-transform: uppercase;
          font-weight: bold;
          margin-top: 4rem;
          width: 12rem;
        }
    }
}

.quickstart-action {
  margin: auto;
  svg {
    height: 4rem;
    width: 4rem;
  }
}

#speed-modal {
  text-align: center !important;
  height: 400px !important;
}

#speed-modal > div > p:nth-child(1) > a > div.title {
  height: 74px !important;
}

#speed-modal > div > p:nth-child(2) > a > div.title {
  height: 74px !important;
}

#import > div.title {
  height: 100px !important;
}

#speed-modal > div > p > a {
  text-align: center !important;
}

#speed-modal > div > p {
  text-align: center !important;
}

#arrow-holder {
  display: inline-block;
  width: 20px !important;
  height: 20px !important;
}
#arrow {
  height: 100%;
  width: 100%;
  padding-bottom: 75% !important;
}

.select-footprint {
  min-width: 10rem;
  height: 1rem !important;
  position: absolute;
  bottom: 25%;
  right: 17%;
}

#copyExisting {
  margin-top: 15px !important;
}

.start-select {
  p {
    padding: 0;
    margin: 0;
  }
  > div {
    display: flex;
    justify-content: space-around;
    font-size: 1rem;
  }
}

#select-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin: 1%;
}
ol, li { 
  list-style: none;
  margin: 0;
  padding: 0;
}

#list-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start !important;
  background-color: white !important;
  border: 1px solid black;
  padding: 2px;
  width: 170px !important;
  // height: 8rem !important;
  font-size: .9rem !important;
  z-index: 9999999999;
  color: black;
  cursor: pointer;
  // overflow: scroll;
  > ol {
    padding: 0;
    border: none;
    li {
      padding: 2px;
      border: none;
    }
    li:hover {
      background-color: #C0C2BE;
    }
  }
}
  
</style>
