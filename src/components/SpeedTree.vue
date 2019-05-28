<template>
  <div id="speedNavigation" ref="speedNavigation" :class="{'adjusted-tree': adjustSizing}">
    <div id="main-tree-container" @click="setSelectionTool">
    <span><building-speed class="button"/>BUILDING</span>
      <ol id="first-ol" v-for="(story, i) in this.stories" :key="story.id">
        <li class="tree-container" id="second">
          <p class="story-p">            
            <a v-if="expanded.includes(story.id)" @click="storyCollapsed(story.id)" title="Collapse story."><speed-collapse class="button tree-button"/></a>
            <a v-if="!expanded.includes(story.id)" @click="storyExpanded(story.id)" title="Expand story."><speed-expand class="button tree-button"/></a>
            <a id="story-a" @click="selectStory(story)" :class="{ selected: story.id === currentStory.id && selectionType === 'story'}" title="Select Story.">
              <story-speed id="story-speed" class="button"/>{{story.name}}
            </a>
            <a v-show="currentStory.id == story.id && selectionType === 'story'" @click="cloneStory(story)" title="Clone story."><speed-copy class="button"/></a>
            <a v-show="currentStory.id == story.id && selectionType === 'story'" v-if="story.name !== 'Story 1'" @click="destroyObject('stories', story)" title="Delete story."><delete-speed class="button tree-button"/></a>
          </p>
            <ol>
              <div v-for="space in story.spaces" :key="space.name">
                <li class="tree-container" v-if="expanded.includes(story.id)">
                  <p>
                    <a v-if="spaceExpanded.includes(space.id)" @click="spaceCollapse(space.id)" title="Collapse space."><speed-collapse class="button tree-button"/></a>
                    <a v-if="!spaceExpanded.includes(space.id)" @click="spaceExpand(space.id)" title="Expand space."><speed-expand class="button tree-button"/></a>
                    <a @click="selectSubItem(space)" :class="{ selected: space.id == currentSubSelection.id && selectionType === 'subselection'}" title="Select space.">
                      <SpaceIconSpeed :id="space.id"/>{{space.name}}
                    </a>
                    <a v-show="currentSubSelection.id == space.id && selectionType === 'subselection'" @click="destroyObject('spaces', space)" title="Delete space.">
                      <delete-speed class="button tree-button"/>
                    </a>
                  </p>
                  <div  title="Space info.">
                    <ol>
                      <li v-if="spaceExpanded.includes(space.id)" :class="{ 'space-detail': currentSubSelection.id === space.id}"><p>{{Math.round(treeSpaceArea(space.id))}} ft²</p></li>
                      <li v-if="spaceExpanded.includes(space.id)" :class="{ 'space-detail': currentSubSelection.id === space.id}"><p>{{getSpaceType(space.space_type_id)}}</p></li>
                    </ol>
                  </div>
                </li>
              </div>
              <div v-for="shading in story.shading" :key="shading.name">
              <li class="tree-container">
                <p>
                  <a v-if="shadingExpanded.includes(shading.id)" @click="shadingCollapse(shading.id)" title="Collapse shading."><speed-collapse class="button tree-button"/></a>
                  <a v-if="!shadingExpanded.includes(shading.id)" @click="shadingExpand(shading.id)" title="Expand shading."><speed-expand class="button tree-button"/></a>
                  <a @click="selectSubItem(shading)" :class="{ selected: shading.id === currentSubSelection.id && selectionType === 'subselection' }" title="Select shading.">
                    <SpaceIconSpeed :id="0" />{{shading.name}}
                  </a>
                  <a v-show="currentSubSelection.id == shading.id" @click="destroyObject('shading', shading)" title="Delete shading.">
                    <delete-speed class="button tree-button"/>
                  </a>  
                </p>
                <ol>
                    <li v-if="shadingExpanded.includes(shading.id)"><p>{{Math.round(treeShadeArea(shading.id))}} ft²</p></li>
                </ol>
              </li>
              </div>
            </ol>
        </li>
        <div id="i" v-show="i !== stories.length-1" :class="{'empty-expanded': empty(story), 'empty-collapsed': !empty(story)}"></div>              
      </ol>
      <circle-speed id="speed-circle" />
    </div>
    <div class="controls">
        <div class="control-button create-with-input" title="Create new shading." @click="setSelectionTool">
          <a @click="createObject('Shading')">
            <create-speed class="button tree-button"/>Shading
          </a>
          <div class="input-container">
            <input
            class="height"
            v-model="shadingHeight"
            title="Specify new shading height"
            size="3"
            > ft
          </div>
        </div>
        <div class="control-button create-with-input" title="Create new story" @click="setSelectionTool">
          <a @click="createObject('Story')">
            <create-speed class="button tree-button"/>Story
          </a>
          <div class="input-container">
            <input
              title="Specify height of new story"
              class="height"
              v-model="storyHeight"
              size="3"
              > ft
          </div>
        </div>
        <div class="control-button" title="Create new space" @click="setSelectionTool">
          <a @click="createObject('Space')">
            <create-speed class="button tree-button"/>Space
          </a>
        </div>
        <div class="control-button" @click="setSelectionTool">
          <a @click="toggleSelects">
            <create-speed class="button tree-button"/>Space Type
          </a>
          <div id="space-type-select-div" v-show="expandSpaceTypes">
            <a id="custom-select-close" @click="closeSpaceTypes">
              <delete-speed class="button tree-button"/>
            </a>
            <ol id="custom-select-type-list" v-for="(type, i) in this.availableTypes" :key="i">
              <li :style="{ color: alreadyInProject(type) }" @click="addSpaceTypeToProject(type)">{{type}}</li>
            </ol>
          </div>
        </div>
        <div id="select-container">
          <div class="project-space-types-div" title="Assign type to current space." >
            <ol v-for="(type, i) in this.projectSpaceTypes" :key="i">
              <li :class="{ selectedType: isCurrentSelectedType(type.id) }" @click="selectSpaceType(type)" @blur="setSelectionTool">
                <div><span :style="{color: typeColor(type.id)}">&block; </span>{{type.name}}</div>
                <a @click="destroyObject('space_type', type)"><delete-speed class="button tree-button"/></a>
              </li>
            </ol>
          </div>
        </div>

        <div id="area-container" @click="setSelectionTool">
          <div class="areas" title="Area of current story."> 
            <div>Story Area</div>
            <div class="input-container"><input size="10" :value="storyArea" readonly/> ft²</div>
          </div>
          <div class="areas" title="Area of building">
            <div>Building Area</div>
            <div class="input-container"><input input size="10" :value="buildingArea" readonly/> ft²</div>
          </div>
        </div>
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
import spaceTypes from './../assets/speed_space_types.json';

export default {
  name: 'SpeedTree',
  props: ['styles', 'objectTypes'],
  data() {
    return {
      expanded: [],
      spaceExpanded: [],
      storyHeight: 10,
      shadingHeight: 10,
      spaceType: null,
      expandSpaceTypes: false,
      shadingExpanded: [],
      adjustSizing: false,
      selectedSpaceType: null,
      availableTypes: spaceTypes.Space_Types,
      selectionType: 'story',
    };
  },
  computed: {
    ...mapState({
      stories: state => state.models.stories,
      geometry: state => state.geometry,
      state: state => state,
      projectSpaceTypes: state => state.models.library.space_types,
      speedSelection: state => state.application.speedSelection,
    }),
    ...mapGetters({
      currentSpace: 'application/currentSpace',
      currentStoryGeomDenorm: 'application/currentStoryDenormalizedGeom',
      currentStoryGeom: 'application/currentStoryGeometry',
      currentStory: 'application/currentStory',
      currentSubSelection: 'application/currentSubSelection',
      storiesArea: 'application/allStoriesArea',
      spacesArea: 'application/allSpacesArea',
      shadingArea: 'application/allShadingArea',
      currentSpaceProperty: 'application/currentSpaceProperty',
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
      return Math.round(Math.abs(geometryHelpers.areaOfSelection(this.currentStoryGeomDenorm.vertices)));
    },
    buildingArea() {
      let totalArea = 0;
      this.geometry.forEach((geom) => {
        totalArea += Math.abs(geometryHelpers.areaOfSelection(geom.vertices));
      });
      return Math.round(totalArea);
    },
    spaces() { return this.currentStory.spaces; },
    shading() { return this.currentStory.shading; },
  },
  watch: {
    currentStory() {
      this.expanded.push(this.currentStory.id);
    },
    currentSubSelection() {
      if (this.currentSubSelection.type === 'space') {
        this.spaceExpanded = [];
        this.spaceExpanded.push(this.currentSubSelection.id);
      } else {
        this.shadingExpanded.push(this.currentSubSelection.id);
      }
    },
  },
  methods: {
    selectStory(story) {
      this.selectionType = 'story';
      this.$store.dispatch('application/setCurrentStoryId', { id: story.id });
      this.setSelectionTool();
    },
    typeColor(id) {
      const type = this.projectSpaceTypes.find(projectType => projectType.id === id);
      if (!type) return '#FFFFFF';
      return type.color;
    },
    toggleSelects() {
      this.expandSpaceTypes = true;
    },
    closeSpaceTypes() {
      this.setSelectionTool();
      this.expandSpaceTypes = false;
    },
    alreadyInProject(name) {
      const isIncluded = this.projectSpaceTypes.some((type) => {
        return type.name === name;
      });
      if (isIncluded) return 'red';
      return 'black';
    },
    empty(story) {
      let thisSpaceLast;
      let notLastSpaceList;
      let aboveSpacesExpanded;
      const someSpacesExpanded = story.spaces.some((space) => {
        const thisSpaceExpanded = this.spaceExpanded.includes(space.id);
        thisSpaceLast = story.spaces[story.spaces.length - 1].id === space.id;
        notLastSpaceList = story.spaces.filter(filterSpace => filterSpace.id !== story.spaces[story.spaces.length - 1]);
        aboveSpacesExpanded = notLastSpaceList.some(someSpace => this.spaceExpanded.includes(someSpace.id));
        return thisSpaceExpanded;
      });
      if (someSpacesExpanded && thisSpaceLast) return 'last-empty';
      else if (someSpacesExpanded && thisSpaceLast && aboveSpacesExpanded) return 'aboved-expanded-last-empty';
      return '';
    },
    notTopOl(index) {
      return index !== 0;
    },
    selectSpaceType(type) {
      this.selectedSpaceType = type;
      this.$store.dispatch('application/setCurrentSpacePropertyId', { id: type.id });
      this.$store.dispatch('application/setCurrentTool', { tool: 'Select' });
      this.$store.commit('application/setSpeedSelection', false);
    },
    setSelectionTool() {
      this.$store.commit('application/setSpeedSelection', true);
    },
    addSpaceTypeToProject(name) {
      const exists = this.projectSpaceTypes.some(type => type.name === name);
      if (exists) {
        this.expandSpaceTypes = false;
        return;
      }
      this.$store.dispatch('models/createObjectWithType', { type: 'space_types' });
      const recentlyAddedType = this.projectSpaceTypes[this.projectSpaceTypes.length - 1];
      this.$store.dispatch('models/updateObjectWithData', { object: recentlyAddedType, name });
      this.expandSpaceTypes = false;
      this.expandProjectSpaceTypes = true;
    },
    selectSubItem(item) {
      let parentStory = this.stories.find(story => story.spaces.find(space => space.id === item.id));
      if (!parentStory) {
        parentStory = this.stories.find(story => story.shading.find(shade => shade.id === item.id));
      }
      if (!parentStory) return;
      this.selectionType = 'subselection';
      this.$store.dispatch('application/setCurrentStoryId', { id: parentStory.id });
      this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id });
      this.setSelectionTool();
    },
    storyExpanded(index) {
      this.expanded.push(index);
      this.setSelectionTool();
    },
    getSpaceType(space_type_id) {
      const found = this.projectSpaceTypes.find(space => space.id === space_type_id);
      if (found) return found.name;
      return 'undefined';
    },
    storyCollapsed(index) {
      this.expanded = this.expanded.filter(item => item !== index);
      this.setSelectionTool();
    },
    spaceExpand(index) {
      this.spaceExpanded.push(index);
      this.setSelectionTool();
    },
    spaceCollapse(index) {
      this.spaceExpanded = this.spaceExpanded.filter(item => item !== index);
      this.setSelectionTool();
    },
    shadingExpand(id) {
      this.shadingExpanded.push(id);
      this.setSelectionTool();
    },
    shadingCollapse(id) {
      this.shadingExpanded = this.shadingExpanded.filter(item => item !== id);
      this.setSelectionTool();
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
      this.setSelectionTool();
      this.$store.dispatch('application/setCurrentStoryId', { id: story.id });
      const { clonedGeometry, idMap } = replaceIdsForCloning(this.currentStoryGeom);
      this.createObject('Clone');
      const { clonedStory } = modelHelpers.replaceIdsUpdateInfoForCloning(story, idMap, this.state, this.currentStory);
      this.destroyObject('spaces', this.currentStory.spaces[0]);
      this.$store.dispatch('models/cloneStory', clonedStory);
      this.$store.dispatch('geometry/cloneStoryGeometry', clonedGeometry);
      for (let i = this.currentStory.shading.length - 1; i >= 0; i--) {
        this.$store.dispatch('models/destroyShading', {
          shading: this.currentStory.shading[i],
          story: this.currentStory,
        });
      }
    },
    isCurrentSelectedType(id) {
      if (this.selectedSpaceType) {
        if (this.selectedSpaceType.id === id && this.speedSelection === false) {
          return true;
        }
      }
      return false;
    },
    createObject(object) {
      const firstFloor = this.$store.state.models.stories.find(s => s.id === '1');
      this.setSelectionTool();
      switch (object) {
        case 'Story':
          this.$store.dispatch('models/initStory');
          this.$store.dispatch('models/updateStoryWithData', { story: this.currentStory, floor_to_ceiling_height: this.storyHeight });
          if (this.currentStory.name !== 'Story 1') {
            this.$store.dispatch('models/destroyShading', {
              shading: this.currentStory.shading[0],
              story: this.currentStory,
            });
          }
          this.selectionType = 'story';
          this.$store.dispatch('application/setCurrentTool', { tool: 'Rectangle' });
          this.selectSubItem(this.currentStory.spaces[0]);
          return;
        case 'Clone':
          this.$store.dispatch('models/initStory');
          this.$store.dispatch('models/updateStoryWithData', { story: this.currentStory, floor_to_ceiling_height: this.storyHeight });
          this.$store.dispatch('application/setCurrentTool', { tool: 'Rectangle' });
          return;
        case 'Space':
          this.$store.dispatch('models/initSpace', { story: this.currentStory });
          this.selectionType = 'subselection';
          this.$store.dispatch('application/setCurrentTool', { tool: 'Rectangle' });
          break;
        case 'Shading':
          this.$store.dispatch('models/initShading', { story: firstFloor });
          this.$store.dispatch('models/updateShadingWithData', { shading: firstFloor.shading[firstFloor.shading.length - 1], floor_to_ceiling_height: this.shadingHeight });
          this.selectionType = 'subselection';
          this.$store.dispatch('application/setCurrentTool', { tool: 'Rectangle' });
          this.subSelectionType = 'shading';
          this.selectSubItem(firstFloor.shading[firstFloor.shading.length - 1]);
          break;
        default:
          this.$store.dispatch('models/createObjectWithType', { type: this.mode });
          break;
      }
    },
    destroyObject(type, object) {
      this.setSelectionTool();
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
    this.$store.dispatch('application/setCurrentMode', { mode: 'space_types' });
    this.$store.dispatch('models/destroyShading', {
      shading: this.currentStory.shading[0],
      story: this.$store.state.models.stories.find(story => story.shading.find(o => o.id === this.currentStory.shading[0].id)),
    });
    this.selectSubItem(this.$store.state.models.stories[0].spaces[0]);
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
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  height: 100%;
  width: 100%;
  font-size: 75%;
  display: flex;
  flex-direction: column;
  background-color: #0073aa;
  color: black;
  a {
    color: black;
  }
  div {
    height: initial;
  }
}

div#main-tree-container {
  position: relative;
  font-size: 1rem !important;
  width: 85%;
  height: 60% !important;
  background-color: white !important;
  overflow: scroll;
}

#first-ol {
  border-top: 3px solid transparent;
}

ol#first-ol:last-of-type ol:last-child > div:last-child > li.tree-container:last-child {
  height: 1.8rem;
}

ol#first-ol:last-of-type > li > ol:last-child {
  padding-bottom: 6rem;
}

.empty-collapsed {
  position: absolute;
  height: 1.4rem !important;
  width: 2px;
  margin-top: .3rem;
  margin-left: 2rem;
  border-left: 3px dashed black;
  z-index: 2;
}

.empty-expanded {
  position: absolute;
  height: 1.4rem !important;
  width: 2px;
  margin-top: .3rem;
  margin-left: 2rem;
  border-left: 3px dashed black;
  z-index: 2;
}

.no-top-border {
  border: 0px;
}

ol, li { 
  list-style: none;
  margin: 0;
  padding: 0;
}

ol {
  padding-left: 1rem;
}

li {
  padding-left: 1.2rem;
  border: 3px dashed black;
  border-width: 0 0 3px 3px;
}

li.tree-container {
  border-bottom: 0px;
}

li.tree-container > p {
  vertical-align: bottom;
}

.story-p {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

#story-a {
  display: flex;
  align-items: flex-end;
  svg {
    vertical-align: bottom;
  }
}

li p {
  margin: 0;
  background: white;
  position: relative;
  top: 0.75em;
}

li ol {
  border-top: 3px dashed black;
  margin-left: -1em;
  padding-left: 1.6em;
}

ol li:last-child ol {
  border-left: 3px solid transparent;
  margin-left: -17px;  
}

#speed-collapse, #speed-expand, #story-speed, #space-cube {
  vertical-align: bottom !important;
  background-color: white !important;
}

#story-speed {
  margin-bottom: -.25rem !important;
}

.controls {
  font-size: 1rem !important;
  height: initial !important;
  display: flex !important;
  flex-direction: column !important;
  color: white !important;
  width: 100%;
  margin-top: 5%;
  a {
    color: white !important;
  } 
  #area-container {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    position: absolute;
    bottom: 1rem;
    width: 100%;
    height: initial !important;
  }
  .areas {
    height: initial !important;
    display: flex !important;
    flex-direction: column !important;
    > div {
      display: flex;
      flex-direction: row;
    }
  }
  input {
    background-color: white !important;
    border: 1px black solid !important;
    text-align: center !important;
    font-size: 1rem !important;
    max-width: 100% !important;
    color: black !important;
    height: 1rem !important;
  }
}

.create-with-input {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 50% !important;
  > div {
    display: flex;
    flex-direction: row;
  }
}

.control-button {
  margin-left: 5%;
  height: initial !important;
  width: 45%;
  height: 100% !important;
  // padding-top: 3%;
  margin-top: 3%;
  input {
    background-color: white;
    margin-bottom: 0 !important;
    border: 1px black solid !important;
    text-align: center !important;
    font-size: 1rem !important;
    max-width: 100% !important;
    color: black !important;
    height: 1rem !important;
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
  color: black !important;
  font-weight: bold;
}

.selected-details {
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

#space-type-select-div {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: white !important;
  border: 1px solid black;
  width: 90%!important;
  height: 8rem !important;
  font-size: 1rem !important;
  z-index: 9999999999;
  color: black;
  cursor: pointer;
  overflow: scroll;
  > ol {
    border: none;
    width: 100%;
    padding: 0;
    li {
      border: none;
    }
    li:hover {
      background-color: #C0C2BE;
    }
  }
}

#custom-select-close {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding-top: 1%;
  padding-right: 1%;
}

.project-space-types-div {
  margin-top: 2%;
  background-color: white !important;
  border: 1px solid black;
  width: 90% !important;
  height: 7rem !important;
  font-size: 1rem !important;
  color: black;
  cursor: pointer;
  overflow-y: scroll;
  overflow-x: hidden;
  > ol {
    padding: 0;
    border: none;
    li {
      border: none;
      padding-left: 0 !important;
      display: flex;
      justify-content: space-between;
    }
    li:hover {
      background-color: #C0C2BE;
    }
  }
  a {
    float: right;
  }
}

#select-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin: 1%;
}


.adjusted-tree {
  height: 65vh !important;
  font-size: 1.1rem !important;
}

#tree-container-space-details > li.space-detail {
  font-weight: bold;
}

.selectedType {
  background-color: #C0C2BE;
}

.input-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  > input {
    margin: 0;
  }
}

#speed-circle {
  height: 1rem;
  float: left;
  padding-left: 3.5%;
}
</style>
