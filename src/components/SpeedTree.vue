<template>
  <div id="speedNavigation">
    <div class="tree-container">
    <span><img class="building" src="https://image.flaticon.com/icons/svg/63/63876.svg" alt="building">BUILDING</span>
    <ol class="tree" v-for="(story, i) in this.stories" :key="i">
      <li>
        <a v-if="expanded.includes(i)" @click="storyCollapsed(i)"><img src="https://image.flaticon.com/icons/svg/149/149172.svg"/></a>
        <a v-if="!expanded.includes(i)" @click="storyExpanded(i)"><img src="https://image.flaticon.com/icons/svg/149/149171.svg"/></a>
        <a @click="selectStory(story)">
          {{story.name}}
          {{this.expanded}}
        </a>
        <a @click="destroyObject('stories', story)"><img src="https://image.flaticon.com/icons/svg/401/401036.svg"/></a>
        </li>
      <div v-if="expanded.includes(i)">
        <ol v-for="(space, j) in story.spaces" :key="j">
          <li>{{space.name}} <a @click="destroyObject('spaces', space)"><img src="https://image.flaticon.com/icons/svg/401/401036.svg"/></a></li>
        </ol>
      </div>
      <div v-if="expanded.includes(i)">
        <ol v-for="(shading, k) in story.shading" :key="k">
          <li>{{shading.name}} <a @click="destroyObject('shading', shading)"><img src="https://image.flaticon.com/icons/svg/401/401036.svg"/></a></li>
        </ol>
      </div>
    </ol>
    </div>
    <div class="controls">
      <div v-for="(object, i) in objectTypes" :key="i">
        <a @click="createObject(object)">
          <div class="control-buttons"><AddNew class="button"/>{{object}}</div>
        </a>
      </div>
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
    currentStory: {
      get() { return this.$store.getters['application/currentStory']; },
      set(story) { this.$store.dispatch('application/setCurrentStoryId', { id: story.id }); },
    },
    currentSubSelection: {
      get() { return this.$store.getters['application/currentSubSelection']; },
      set(item) { this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id }); },
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
      debugger;
      switch (type) {
        case 'stories':
          this.$store.dispatch('models/destroyStory', { story: object });
          return;
        case 'spaces':
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
<style lang="css" scoped>
#speedNavigation {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  background-color: #4EACEA;
  color: black;
}

.tree-container {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  background-color: white;
  padding: 10%;
  height: 50%;
  width: 100%;
  overflow: scroll;
}

ol.tree, ol.tree ol{
  list-style: none;
  margin: 1%;
  padding: 3%;
}

ol.tree ol {
  margin-left: 1%;
}

ol > ol > li {
  margin-left: 5%;
}


ol.tree li {
  line-height: 1em;
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
  margin-left: 20%;
}

.control-buttons {
  min-width: 30%;
  justify-content: flex-start;
}

.area-info {
  margin-left: 20%;
  padding-bottom: 5%;
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
</style>
