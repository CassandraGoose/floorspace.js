<template>
  <div id="speedNavigation" ref="speedNavigation" :class="{'adjusted-tree': adjustSizing}">
    <div id="main-tree-container">
    <span><building-speed class="button"/>BUILDING</span>
      <ol id="first-ol" v-for="(story, i) in this.stories" :key="i">
        <li class="tree-container" id="second">
          <p class="story-p">            
            <a v-if="expanded.includes(i)" @click="storyCollapsed(i)" title="Collapse story."><speed-collapse class="button tree-button"/></a>
            <a v-if="!expanded.includes(i)" @click="storyExpanded(i)" title="Expand story."><speed-expand class="button tree-button"/></a>
            <a id="story-a" @click="selectStory(story)" :class="{ selected: story.id === currentStory.id }" title="Select Story.">
              <story-speed id="story-speed" class="button"/>{{story.name}}
            </a>
            <a v-show="currentStory.id == story.id" @click="cloneStory(story)" title="Clone story."><speed-copy class="button"/></a>
            <a v-show="currentStory.id == story.id" v-if="story.name !== 'Story 1'" @click="destroyObject('stories', story)" title="Delete story."><delete-speed class="button tree-button"/></a>
          </p>
            <ol :class="{'no-top-border': notTopOl(j)}" v-for="(space, j) in story.spaces" :key="j">
              <li class="tree-container" v-if="expanded.includes(i)">
                <p>
                  <a v-if="spaceExpanded.includes(space.id)" @click="spaceCollapse(space.id)" title="Collapse space."><speed-collapse class="button tree-button"/></a>
                  <a v-if="!spaceExpanded.includes(space.id)" @click="spaceExpand(space.id)" title="Expand space."><speed-expand class="button tree-button"/></a>
                  <a @click="selectSubItem(space)" :class="{ selected: space.id == currentSubSelection.id }" title="Select space.">
                    <SpaceIconSpeed :id="space.id"/>{{space.name}}
                  </a>
                  <a v-show="currentSubSelection.id == space.id" @click="destroyObject('spaces', space)" title="Delete space.">
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
              <div v-for="(shading, k) in story.shading" :key="k">
              <li class="tree-container">
                <p>
                  <a v-if="shadingExpanded.includes(shading.id)" @click="shadingCollapse(shading.id)" title="Collapse shading."><speed-collapse class="button tree-button"/></a>
                  <a v-if="!shadingExpanded.includes(shading.id)" @click="shadingExpand(shading.id)" title="Expand shading."><speed-expand class="button tree-button"/></a>
                  <a @click="selectSubItem(shading)" :class="{ selected: shading.id === currentSubSelection.id }" title="Select shading.">
                    <SpaceIconSpeed :id="0" />{{shading.name}}
                  </a>
                  <a v-show="currentSubSelection.id == shading.id" @click="destroyObject('shading', shading)" title="Delete shading.">
                    <delete-speed class="button tree-button"/>
                  </a>  
                </p>
                <ol>
                    <li><p>{{Math.round(treeShadeArea(shading.id))}} ft²</p></li>
                </ol>
              </li>
              </div>
            </ol>
        </li>
        <div id="i" v-show="i !== stories.length-1" :class="{'empty-expanded': empty(story), 'empty-collapsed': !empty(story)}"></div>              
      </ol>
    </div>
    <div class="controls">
        <div class="control-button create-with-input" title="Create new shading.">
          <a @click="createObject('Shading')">
            <create-speed class="button tree-button"/>Shading
          </a>
          <div>
            <input
            class="height"
            v-model="shadingHeight"
            title="Specify new shading height"
            size="3"
            > ft
          </div>
        </div>
        <div class="control-button create-with-input" title="Create new story">
          <a @click="createObject('Story')">
            <create-speed class="button tree-button"/>Story
          </a>
          <div>
            <input
              title="Specify height of new story"
              class="height"
              v-model="storyHeight"
              size="3"
              > ft
          </div>
        </div>
        <div class="control-button" title="Create new space">
          <a @click="createObject('Space')">
            <create-speed class="button tree-button"/>Space
          </a>
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
        <div id="area-container">
          <div class="areas" title="Area of current story."> 
            <div>Story Area: </div>
            <div><input size="10" :value="storyArea" readonly/> ft²</div>
          </div>
          <div class="areas" title="Area of building">
            <div>Building Area: </div>
            <div><input input size="10" :value="buildingArea" readonly/> ft²</div>
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
      currentSpace: 'application/currentSpace',
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
      this.expanded.push(this.stories.indexOf(this.currentStory));
    },
    currentSubSelection() {
      if (this.currentSubSelection.type === 'space') {
        this.spaceExpanded = [];
        this.spaceExpanded.push(this.currentSubSelection.id);
      } else this.shadingExpanded.push(this.currentSubSelection.id);
    },
  },
  methods: {
    selectStory(story) {
      this.$store.dispatch('application/setCurrentStoryId', { id: story.id });
    },
    empty(story) {
      // if last space expanded, add the full extra
      // else if any of the other spaces of a story are expanded, the last space gets small extra
      let thing3;
      let thing4;
      let thing5;
      const thing1 = story.spaces.some((space) => {
        // if this space is expanded
        const thing2 = this.spaceExpanded.includes(space.id);
        // if this space is the last space
        thing3 = story.spaces[story.spaces.length - 1].id === space.id;
        thing4 = story.spaces.filter((filterSpace) => {
          return filterSpace.id !== story.spaces[story.spaces.length - 1];
        });
        thing5 = thing4.some((someSpace) => {
          return this.spaceExpanded.includes(someSpace.id);
        });
        return thing2;
      });
      if (thing1 && thing3) return 'last-empty';
      else if (thing1 && thing3 && thing5) return 'aboved-expanded-last-empty';
      else return;
    },
    notTopOl(index) {
      return index !== 0;
    },
    addSpaceType(e) {
      this.$store.dispatch('models/updateSpaceWithData', { space: this.currentSubSelection, type: e.target.value });
      this.expandSpaceTypes = false;
    },
    selectSubItem(item) {
      let parentStory = this.stories.find(story => story.spaces.find(space => space.id === item.id));
      if (!parentStory) {
        parentStory = this.stories.find(story => story.shading.find(shade => shade.id === item.id));
      }
      if (!parentStory) return;
      this.$store.dispatch('application/setCurrentStoryId', { id: parentStory.id });
      this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id });
    },
    storyExpanded(index) {
      this.expanded.push(index);
    },
    getSpaceType(space_type_id) {
      return 'undefined';
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
      this.currentStory.shading.forEach((shade) => {
        this.$store.dispatch('models/destroyShading', {
          shading: shade, story: this.currentStory,
        });
      });
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
            this.$store.dispatch('models/destroyShading', {
              shading: this.currentStory.shading[0],
              story: this.currentStory,
            });
          }
          return;
        case 'Space':
          this.$store.dispatch('models/initSpace', { story: this.currentStory });
          break;
        case 'Shading':
          this.$store.dispatch('models/initShading', { story: this.$store.state.models.stories.find(s => s.id === '1') });
          this.$store.dispatch('models/updateShadingWithData', { shading: this.$store.state.models.stories[0].shading[this.$store.state.models.stories[0].shading.length - 1], floor_to_ceiling_height: this.shadingHeight });
          this.selectSubItem(this.$store.state.models.stories[0].shading[this.$store.state.models.stories[0].shading.length - 1]);
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
      this.eventBus.$emit('drawingToolsSizeUpdate');
    });
    this.$store.dispatch('models/destroyShading', {
      shading: this.currentStory.shading[0],
      story: this.$store.state.models.stories.find(story => story.shading.find(o => o.id === this.currentStory.shading[0].id)),
    });
    this.$root.$options.eventBus.$emit('drawingToolsSizeUpdate');
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

div#main-tree-container #first-ol:last-child  li.tree-container:last-child ol:last-child li.tree-container:last-child {
  height: 1.8rem;
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
  z-index: 99;
  font-size: 1rem !important;
  height: initial !important;
  display: flex !important;
  flex-direction: column !important;
  color: white !important;
  width: 100%;
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
  margin-top: 5%;
  margin-left: 10%;
  height: initial !important;
  width: 45%;
  height: 1rem;
  padding-top: 3%;
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
  height: 65vh !important;
  font-size: 1.1rem !important;
}

#tree-container-space-details > li.space-detail {
  font-weight: bold;
}

</style>
