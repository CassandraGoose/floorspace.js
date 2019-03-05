<template>
  <div id="speedNavigation">
    <div class="tree-container">
    <span><img class="building" src="https://image.flaticon.com/icons/svg/63/63876.svg" alt="building">BUILDING</span>
    <ol class="tree" v-for="(story, i) in this.stories" :key="i">
      <li>
        <a v-if="expanded.includes(i)" @click="storyCollapsed(i)"><img src="https://image.flaticon.com/icons/svg/149/149172.svg"/></a>
        <a v-if="!expanded.includes(i)" @click="storyExpanded(i)"><img src="https://image.flaticon.com/icons/svg/149/149171.svg"/></a>
        <a @click="selectStory(story)" :class="{ selected: story.id === currentStory.id }">
          {{story.name}}
        </a>
        <a @click="destroyObject('stories', story)"><img src="https://image.flaticon.com/icons/svg/401/401036.svg"/></a>
        </li>
      <div v-if="expanded.includes(i)">
        <ol v-for="(space, j) in story.spaces" :key="j">
          <li>
            <a @click="selectSubItem(space)" :class="{ selected: space.id === this.currentSubSelectionId }">{{space.name}} </a>
            <a @click="destroyObject('spaces', space)">
              <img src="https://image.flaticon.com/icons/svg/401/401036.svg"/>
            </a>
          </li>
        </ol>
      </div>
      <div v-if="expanded.includes(i)">
        <ol v-for="(shading, k) in story.shading" :key="k">
          <li>
            <a @click="selectSubItem(shading)" :class="{ selected: shading.id === this.currentSubSelectionId }">{{shading.name}}</a>
              <a @click="destroyObject('shading', shading)">
                <img src="https://image.flaticon.com/icons/svg/401/401036.svg"/>
              </a>
            </li>
        </ol>
      </div>
    </ol>
    </div>
    <div class="controls">
      <!-- when all objectTypes are ready, use the v-for below -->
        <!-- <div v-for="(object, i) in objectTypes" :key="i">
          <a @click="createObject(object)">
            <div><AddNew class="button"/>{{object}}</div>
          </a>
        </div> -->
        <a @click="createObject('Story')">
          <div><AddNew class="button"/>Story</div>
        </a>
        <a @click="createObject('Space')"><div><AddNew class="button"/>Space</div></a>
      </div>
      <div class="area-info">
        <div>Story Area: <span class="area">{{storyArea}}</span> ft²</div>
        <div>Building Area: <span class="area">{{buildingArea}}</span> ft²</div>
      </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import _ from 'lodash';
import Library from './Library.vue';
import AddNew from './../assets/svg-icons/add_new.svg';
import geometryHelpers from './../store/modules/geometry/helpers';

export default {
  name: 'SpeedTree',
  props: ['styles', 'objectTypes'],
  data() {
    return {
      expanded: [0],
    };
  },
  computed: {
    ...mapState({
      stories: state => state.models.stories,
      geometry: state => state.geometry,
    }),
    ...mapGetters({
      currentStoryGeom: 'application/currentStoryDenormalizedGeom',
      currentStory: 'application/currentStory',
      currentSubSelectionId: 'application/currentSubSelection',
    }),
    storyArea() {
      return Math.abs(geometryHelpers.areaOfSelection(this.currentStoryGeom.vertices));
    },
    buildingArea() {
      let totalArea = 0;
      this.geometry.forEach((geom) => {
        totalArea += Math.abs(geometryHelpers.areaOfSelection(geom.vertices));
      });
      return totalArea;
    },
    spaces() { return this.currentStory.spaces; },
    shading() { return this.currentStory.shading; },
  },
  methods: {
    selectStory(story) {
      this.$store.dispatch('application/setCurrentStoryId', { id: story.id });
    },
    selectSubItem(item) {
      this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id });
    },
    storyExpanded(index) {
      this.expanded.push(index);
    },
    storyCollapsed(index) {
      this.expanded = this.expanded.filter(item => item !== index);
    },
    // REPEATED
    subselectionType: {
      get() { return this.$store.state.application.currentSelections.subselectionType; },
      set(sst) { this.$store.dispatch('application/setCurrentSubselectionType', { subselectionType: sst }); },
    },
    // REPEATED
    createObject(object) {
      switch (object) {
        case 'Story':
          this.$store.dispatch('models/initStory');
          return;
        case 'Space':
          this.$store.dispatch('models/initSpace', { story: this.currentStory });
          break;
        case 'Shading':
          this.$store.dispatch('models/initShading', { story: this.currentStory });
          break;
        default:
          this.$store.dispatch('models/createObjectWithType', { type: this.mode });
          break;
      }
      this.selectLatest();
    },
    selectLatest() {
      const newestRow = _.maxBy(this.rows, r => +r.id);
      if (!newestRow) { return; }
      this.selectedObject = newestRow;
    },
    // REPEATED W/O type param... so need to refactor 
    destroyObject(type, object) {
      switch (type) {
        case 'stories':
          this.$store.dispatch('models/destroyStory', { story: object });
          return;
        case 'spaces':
        console.log(this.$store.state.models.stories.find(story => story[type].find(o => o.id === object.id)));
          this.$store.dispatch('models/destroySpace', {
            space: object,
            story: this.$store.state.models.stories.find(story => story[type].find(o => o.id === object.id)),
          });
          break;
        case 'shading':
          this.$store.dispatch('models/destroyShading', {
            shading: object,
            story: this.$store.state.models.stories.find(story => story[type].find(o => o.id === object.id)),
          });
          break;
        case 'images':
          this.$store.dispatch('models/destroyImage', {
            image: object,
            story: this.$store.state.models.stories.find(story => story[type].find(o => o.id === object.id)),
          });
          break;
        case 'window_definitions':
          this.$store.dispatch('models/destroyWindowDef', { object });
          break;
        case 'daylighting_control_definitions':
          this.$store.dispatch('models/destroyDaylightingControlDef', { object });
          break;
        case 'door_definitions':
          this.$store.dispatch('models/destroyDoorDef', { object });
          break;
        case 'windows':
          this.$store.dispatch('models/destroyWindow', { story_id: this.currentStory.id, object });
          break;
        case 'daylighting_controls':
          this.$store.dispatch('models/destroyDaylightingControl', { story_id: this.currentStory.id, object });
          break;
        default:
          this.$store.dispatch('models/destroyObject', { object });
          break;
      }
    },
  },
  mounted() {
    this.$store.dispatch('project/setMapEnabled', { enabled: true });
    this.$store.dispatch('application/setCurrentTool', { tool: 'Map' });
  },
  watch: {
    // REPEATED
    rows() {
      if (!(this.selectedObject && _.includes(_.map(this.rows, 'id'), this.selectedObject.id)) && this.rows.length > 0) {
        this.selectedObject = this.rows[0];
      }
    },
  },
  components: {
    Library,
    AddNew,
  },
};
</script>
<style lang="scss" scoped>
@import "./../scss/main.scss";

#speedNavigation {
  font-size: 75%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #4EACEA;
  color: black;
}

.tree-container {
  padding-top: 5%;
  padding-right: 5%;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  background-color: white;
  align-content: center;
  height: 50%;
  width: 100%;
  overflow-y: scroll;
}

ol.tree, ol.tree ol{
  list-style: none;
  margin: 1%;
  padding-left: 10%;
}

ol.tree li {
  padding-top: 3%;
  color: black;
  font-weight: bold;
  border-left: 1px dotted black;
}

ol.tree li:last-child, ol.tree li:first-child {
  border-left: none;
}

ol.tree li:before {
  position: relative;
  top: -.3em;
  height: 1.5em;
  width: 10%;
  color: white;
  border-bottom: 1px dotted black;
  content: "";
  display: inline-block;
  left: -3%;
}

ol.tree li:last-child:before {
  border-left: 1px dotted black;
}

.controls {
  display: flex;
  flex-direction: column;
  height: 40%;
  justify-content: center;
  margin-left: 25%;
}

.area-info {
  display: flex;
  height: 10%;
  flex-direction: column;
  margin-left: 25%;
  margin-bottom: 10%;
}

.area {
  background-color: white;
  padding-left: 5%;
  padding-right: 5%;
}

.building {
  max-height: 20px;
  max-width: 20px;
}

img {
  max-height: 10px;
  max-width: 10px;
}

.selected {
  text-decoration: underline;
  color: red;
  font-weight: bold;
}
</style>


#speedNavigation > div.controls-container > div.controls > div:nth-child(1) > a > div