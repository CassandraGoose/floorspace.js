<template>
  <div id="speedNavigation" :class="{'adjusted-tree': adjustSizing}">
    <div id="tree-container">
    <span><building-speed class="button"/>BUILDING</span>
    <ol class="tree" id="tree-container-story" v-for="(story, i) in this.stories" :key="i">
      <li class="story-li">
        <a v-if="expanded.includes(i)" @click="storyCollapsed(i)" title="Collapse story."><speed-collapse class="button tree-button"/></a>
        <a v-if="!expanded.includes(i)" @click="storyExpanded(i)" title="Expand story."><speed-expand class="button tree-button"/></a>
        <a @click="selectStory(story)" :class="{ selected: story.id === currentStory.id }" title="Select Story.">
          <story-speed class="button"/>{{story.name}}
        </a>
        <a @click="cloneStory(story)" title="Clone story."><speed-copy class="button"/></a>
        <a v-show="currentStory.id == story.id" v-if="story.name !== 'Story 1'" @click="destroyObject('stories', story)" title="Delete story."><delete-speed class="button tree-button"/></a>
        </li>
      <div id="space-list-div" v-if="expanded.includes(i)">
        <ol id="tree-container-space-list" v-for="(space, j) in story.spaces" :key="j">
          <li class="space-li" id="floorspace-spaces-li">
            <a v-if="spaceExpanded.includes(space.id)" @click="spaceCollapse(space.id)" title="Collapse space."><speed-collapse class="button tree-button"/></a>
            <a v-if="!spaceExpanded.includes(space.id)" @click="spaceExpand(space.id)" title="Expand space."><speed-expand class="button tree-button"/></a>
            <a @click="selectSubItem(space)" :class="{ selected: space.id == currentSubSelection.id }" title="Select space.">
              <SpaceIconSpeed :id="space.id"/>{{space.name}}
              <a v-show="currentSubSelection.id == space.id" @click="destroyObject('spaces', space)" title="Delete space.">
                <delete-speed class="button tree-button"/>
              </a>
            </a>
          </li>
          <div v-if="spaceExpanded.includes(space.id)" title="Space info.">
            <ol id="tree-container-space-details" class="space-shade-info">
              <li><span>{{Math.round(treeSpaceArea(space.id) * 100) / 100}} ft²</span></li>
              <li><span>{{space.type}}</span></li>
            </ol>
          </div>
        </ol>
      </div>
      <div v-if="expanded.includes(i)">
        <ol id="tree-container-shade-list" v-for="(shading, k) in story.shading" :key="k">
          <li class="space-li" id="floorspace-shade-li">
            <a v-if="shadingExpanded.includes(shading.id)" @click="shadingCollapse(shading.id)" title="Collapse shading."><speed-collapse class="button tree-button"/></a>
            <a v-if="!shadingExpanded.includes(shading.id)" @click="shadingExpand(shading.id)" title="Expand shading."><speed-expand class="button tree-button"/></a>
            <a @click="selectSubItem(shading)" :class="{ selected: shading.id === currentSubSelection.id }" title="Select shading.">
              <SpaceIconSpeed :id="0" />{{shading.name}}
            </a>
            <a v-show="currentSubSelection.id == shading.id" @click="destroyObject('shading', shading)" title="Delete shading.">
              <delete-speed class="button tree-button"/>
            </a>  
          </li>
            <div v-if="shadingExpanded.includes(shading.id)" title="Shading info">
              <ol id="tree-container-shade-details" class="space-shade-info">
                <li><span>{{Math.round(treeShadeArea(shading.id) * 100) / 100}} ft²</span></li>
              </ol>
            </div>
        </ol>
      </div>
    </ol>
    </div>
    <div class="controls">
        <div class="control-button" title="Create new story">
          <a @click="createObject('Story')">
            <create-speed class="button tree-button"/>Story
          </a>
          <input
            title="Specify height of new story"
            class="height"
            v-model="storyHeight"
            size="3"
            > ft
        </div>
        <div class="control-button" title="Create new space">
          <a @click="createObject('Space')">
            <create-speed class="button tree-button"/>Space
          </a>
        </div>
        <div class="control-button" title="Create new shading.">
          <a @click="createObject('Shading')">
            <create-speed class="button tree-button"/>Shading
          </a>
            <input
            class="height"
            v-model="shadingHeight"
            title="Specify new shading height"
            size="3"
            > ft
        </div>
        <div class="control-button" title="Assign type to current space.">
          <a @click="expandSpaceTypes = true">
            <create-speed class="button tree-button"/>Space Type
          </a>
          <div class="space-type-select" v-show="expandSpaceTypes">
            <select @change="addSpaceType" size="5">
              <option value="" selected disabled>Space Type</option>
              <option value="Office-Open">Office-Open</option>
              <option value="Office-Private">Office-Private</option>
              <option value="Retail-Retail">Retail-Retail</option>
              <option value="Retail-1">Retail-1</option>
              <option value="Retail-2">Retail-2</option>
              <option value="Retail-3">Retail-1</option>
              <option value="Retail-4">Retail-2</option>
            </select>
          </div>
        </div>
          <div class="areas" title="Area of current story.">Story Area: <span class="area">{{storyArea}}</span> ft²</div>
          <div class="areas" title="Area of building">Building Area: <span class="area">{{buildingArea}}</span> ft²</div>
      </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import _ from 'lodash';
import Library from './Library.vue';
import AddNew from './../assets/svg-icons/add_new.svg';
import svgs from './svgs';
import SpaceIconSpeed from './SpaceIconSpeed.vue';
import geometryHelpers, { replaceIdsForCloning } from './../store/modules/geometry/helpers';
import modelHelpers from '../store/modules/models/helpers';

export default {
  name: 'SpeedTree',
  props: ['styles', 'objectTypes'],
  data() {
    return {
      expanded: [0],
      spaceExpanded: [0],
      storyHeight: 10,
      shadingHeight: 10,
      spaceType: null,
      expandSpaceTypes: false,
      shadingExpanded: [],
      adjustSizing: false,
    };
  },
  computed: {
    ...mapState({
      stories: state => state.models.stories,
      geometry: state => state.geometry,
      state: state => state,
    }),
    ...mapGetters({
      currentStoryGeomDenorm: 'application/currentStoryDenormalizedGeom',
      currentStoryGeom: 'application/currentStoryGeometry',
      currentStory: 'application/currentStory',
      currentSubSelection: 'application/currentSubSelection',
      storiesArea: 'application/allStoriesArea',
      spacesArea: 'application/allSpacesArea',
      shadingArea: 'application/allShadingArea',
    }),
    min_x: {
      get() { return this.$store.state.project.view.min_x; },
      set(val) { this.$store.dispatch('project/setViewMinX', { min_x: val }); },
    },
    min_y: {
      get() { return this.$store.state.project.view.min_y; },
      set(val) { this.$store.dispatch('project/setViewMinY', { min_y: val }); },
    },
    max_x: {
      get() { return this.$store.state.project.view.max_x; },
      set(val) { this.$store.dispatch('project/setViewMaxX', { max_x: val }); },
    },
    max_y: {
      get() { return this.$store.state.project.view.max_y; },
      set(val) { this.$store.dispatch('project/setViewMaxY', { max_y: val }); },
    },
    storyArea() {
      return Math.round(Math.abs(geometryHelpers.areaOfSelection(this.currentStoryGeomDenorm.vertices)) * 100) / 100;
    },
    buildingArea() {
      let totalArea = 0;
      this.geometry.forEach((geom) => {
        totalArea += Math.abs(geometryHelpers.areaOfSelection(geom.vertices));
      });
      return Math.round(totalArea * 100) / 100;
    },
    spaces() { return this.currentStory.spaces; },
    shading() { return this.currentStory.shading; },
  },
  watch: {
    currentStory() {
      this.expanded.push(this.stories.indexOf(this.currentStory));
    },
    currentSubSelection() {
      if (this.currentSubSelection.type === 'space') this.spaceExpanded.push(this.currentSubSelection.id);
      else this.shadingExpanded.push(this.currentSubSelection.id);
    },
  },
  methods: {
    selectStory(story) {
      this.$store.dispatch('application/setCurrentStoryId', { id: story.id });
    },
    addSpaceType(e) {
      this.expandSpaceTypes = false;
      this.$store.dispatch('models/updateSpaceWithData', { space: this.currentSubSelection, type: e.target.value });
    },
    selectSubItem(item) {
      const parentStory = this.stories.find(story => story.spaces.find(space => space.id === item.id));
      if (!parentStory) return;
      this.$store.dispatch('application/setCurrentStoryId', { id: parentStory.id });
      this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id });
    },
    storyExpanded(index) {
      this.expanded.push(index);
    },
    storyCollapsed(index) {
      this.expanded = this.expanded.filter(item => item !== index);
    },
    spaceExpand(index) {
      this.spaceExpanded.push(index);
    },
    spaceCollapse(index) {
      this.spaceExpanded = this.spaceExpanded.filter(item => item !== index);
    },
    shadingExpand(index) {
      this.shadingExpanded.push(index);
    },
    shadingCollapse(index) {
      this.shadingExpanded = this.shadingExpanded.filter(item => item !== index);
    },
    treeSpaceArea(id) {
      if (!this.spacesArea) return '0';
      if (!this.spacesArea[id]) return '0';
      if (this.spacesArea[id] < 0) return -(this.spacesArea[id]);
      return Math.abs(this.spacesArea[id]);
    },
    treeShadeArea(id) {
      if (!this.shadingArea) return '0';
      if (!this.shadingArea[id]) return '0';
      if (this.shadingArea[id] < 0) return -(this.shadingArea[id]);
      return Math.abs(this.shadingArea[id]);
    },
    cloneStory(story) {
      this.$store.dispatch('application/setCurrentStoryId', { id: story.id });
      const { clonedGeometry, idMap } = replaceIdsForCloning(this.currentStoryGeom);
      this.createObject('Story');
      const { clonedStory } = modelHelpers.replaceIdsUpdateInfoForCloning(story, idMap, this.state, this.currentStory);
      this.destroyObject('spaces', this.currentStory.spaces[0]);
      this.$store.dispatch('models/cloneStory', clonedStory);
      this.$store.dispatch('geometry/cloneStoryGeometry', clonedGeometry);
    },
    subselectionType: {
      get() { return this.$store.state.application.currentSelections.subselectionType; },
      set(sst) { this.$store.dispatch('application/setCurrentSubselectionType', { subselectionType: sst }); },
    },
    createObject(object) {
      switch (object) {
        case 'Story':
          this.$store.dispatch('models/initStory');
          this.$store.dispatch('models/updateStoryWithData', { story: this.currentStory, floor_to_ceiling_height: this.storyHeight });
          if (this.currentStory.name !== 'Story 1') {
            this.$store.dispatch('models/updateStoryWithData', { story: this.currentStory, shading: [] });
          }
          return;
        case 'Space':
          this.$store.dispatch('models/initSpace', { story: this.currentStory });
          break;
        case 'Shading':
          this.$store.dispatch('models/initShading', { story: this.$store.state.models.stories.find(s => s.id === '1') });
          this.$store.dispatch('models/updateShadingWithData', { shading: this.$store.state.models.stories[0].shading[this.$store.state.models.stories[0].shading.length - 1], floor_to_ceiling_height: this.shadingHeight });
          break;
        default:
          this.$store.dispatch('models/createObjectWithType', { type: this.mode });
          break;
      }
    },
    destroyObject(type, object) {
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
  mounted() {
    this.$store.dispatch('project/setMapEnabled', { enabled: true });
    this.$store.dispatch('application/setCurrentTool', { tool: 'Map' });
    this.$root.$options.eventBus.$on('expandFloorspace', (bool) => {
      this.adjustSizing = bool;
    });
    this.$store.dispatch('models/destroyShading', {
      shading: this.currentStory.shading[0],
      story: this.$store.state.models.stories.find(story => story.shading.find(o => o.id === this.currentStory.shading[0].id)),
    });
  },
  components: {
    Library,
    AddNew,
    SpaceIconSpeed,
    ...svgs,
  },
};
</script>
<style lang="scss" scoped>
@import "./../scss/main.scss";

* {
  margin: 0px; 
}

#speedNavigation {
  height: 100%;
  width: 100%;
  font-size: 75%;
  display: flex;
  flex-direction: column;
  background-color: #4EACEA;
  color: black;
  a {
    color: black;
  }
  div {
    height: initial;
  }
}

#tree-container {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  background-color: white;
  width: 85%;
  align-content: center;
  overflow-y: scroll;
  height: 60% !important;
}

#tree-container ol {
  padding-left: 8%;
}

#tree-container-story {
  padding-left: 2%;
}

#tree-container-space-list {
  padding-left: 28%;
}

#tree-container-shade-list {
  padding-left: 28%;
}

#tree-container-shade-details {
  padding-left: 40%;
}

#tree-container-space-details {
  padding-left: 40%;
}

ol.tree, ol.tree ol{
  list-style: none;
}

ol.tree li {
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
}

.story-li {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.space-li {
  display: inline;
  vertical-align: center;
}

.space-shade-info > li {
  margin-top: 3%;
  margin-left: 1%;
}

.space-shade-info > li > span {
  margin-left: 5%;
}

ol.tree li:last-child:before {
  border-left: 1px dotted black;
}

.controls {
  height: initial !important;
  display: flex !important;
  flex-direction: column !important;
  justify-items: center !important;
  justify-content: center !important;
  align-items: center !important;
  color: black !important;
  width: 100%;
  height: 100%;
  a {
    color: black;
  }
  div:nth-child(5), div:nth-child(6) {
    height: initial !important;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-self: flex-end;
    min-width: 40%;
    padding-right: 2%;
    align-items: center;
    margin-top: 2rem;
    .area {
      background-color: white;
      padding: 1% 4% 1% 4%;
      border: 2px solid gray;
      width: 60px;
    }
  }
}

.control-button {
  height: initial !important;
  width: 45%;
  height: 1rem;
  padding-top: 3%;
  input {
    min-width: 1.6rem !important;
    margin-bottom: 0 !important;
  }
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
  color: red !important;
  font-weight: bold;
}

.height {
  max-width: 10%;
  margin-left: 1%;
}

.input-select {
  display: inline;
}

.input-select select{ 
  height: initial !important;
  color: white;
  max-width: 75px;
  padding: 0;
}

select {
  height: initial !important;
}

.tree-button {
  max-height: 14px;
}

svg.button.tree-button {
  width: 1.5rem;
}

#floorspace-spaces-li, #floorspace-shade-li {
  height: initial !important;
}

.adjust-font {
  font-size: 90%;
}

.space-type-select {
  position: absolute;
  z-index: 900;
  margin: 1%;
  min-height: 2rem;
}

#space-list-div {
  height: initial !important;
}

.adjusted-tree {
  height: 82vh !important;
  font-size: 1.1rem !important;
}

</style>
