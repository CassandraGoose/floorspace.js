<template>
  <div id="speedNavigation">
    <div class="tree-container">
    <span><building-speed class="button"/>BUILDING</span>
    <ol class="tree" v-for="(story, i) in this.stories" :key="i">
      <li class="story-li">
        <a v-if="expanded.includes(i)" @click="storyCollapsed(i)"><speed-collapse class="button tree-button"/></a>
        <a v-if="!expanded.includes(i)" @click="storyExpanded(i)"><speed-expand class="button tree-button"/></a>
        <a @click="selectStory(story)" :class="{ selected: story.id === currentStory.id }">
          <story-speed class="button"/>{{story.name}}
        </a>
        <a @click="cloneStory(story)"><speed-copy class="button"/></a>
        <a @click="destroyObject('stories', story)"><delete-speed class="button tree-button"/></a>
        </li>
      <div v-if="expanded.includes(i)">
        <ol v-for="(space, j) in story.spaces" :key="j">
          <li class="space-li">
            <a v-if="spaceExpanded.includes(space.id)" @click="spaceCollapse(space.id)"><speed-collapse class="button tree-button"/></a>
            <a v-if="!spaceExpanded.includes(space.id)" @click="spaceExpand(space.id)"><speed-expand class="button tree-button"/></a>
            <a @click="selectSubItem(space)" :class="{ selected: space.id == currentSubSelection.id }">
              <SpaceIconSpeed :id="space.id"/>{{space.name}}
              <a @click="destroyObject('spaces', space)">
                <delete-speed class="button tree-button"/>
              </a>
            </a>
          </li>
          <div v-if="spaceExpanded.includes(space.id)">
            <ol class="space-shade-info">
              <li><span>{{treeSpaceArea(space.id)}} ft²</span></li>
              <li><span>{{space.type}}</span></li>
            </ol>
          </div>
        </ol>
      </div>
      <div v-if="expanded.includes(i)">
        <ol v-for="(shading, k) in story.shading" :key="k">
          <li class="space-li">
            <a v-if="shadingExpanded.includes(shading.id)" @click="shadingCollapse(shading.id)"><speed-collapse class="button tree-button"/></a>
            <a v-if="!shadingExpanded.includes(shading.id)" @click="shadingExpand(shading.id)"><speed-expand class="button tree-button"/></a>
            <a @click="selectSubItem(shading)" :class="{ selected: shading.id === currentSubSelection.id }">
              <SpaceIconSpeed :id="0" />{{shading.name}}
            </a>
            <a @click="destroyObject('shading', shading)">
              <delete-speed class="button tree-button"/>
            </a>  
          </li>
            <div v-if="shadingExpanded.includes(shading.id)">
              <ol class="space-shade-info">
                <li><span>{{treeShadeArea(shading.id)}} ft²</span></li>
              </ol>
            </div>
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
        <div class="control-button">
          <a @click="createObject('Story')">
            <create-speed class="button tree-button"/>Story
          </a>
          <input class="height" v-model="storyHeight"> ft
        </div>
        <div class="control-button">
          <a @click="createObject('Space')">
            <create-speed class="button tree-button"/>Space
          </a>
        </div>
        <div class="control-button">
          <a @click="createObject('Shading')">
            <create-speed class="button tree-button"/>Shading
          </a>
            <input class="height" v-model="shadingHeight"> ft
        </div>
        <div class="control-button">
          <a @click="expandSpaceTypes = true">
            <create-speed class="button tree-button"/>Space Type
          </a>
          <div v-show="expandSpaceTypes">
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
import svgs from './svgs';
import SpaceIconSpeed from './SpaceIconSpeed.vue';
import geometryHelpers, { replaceIdsForCloning }from './../store/modules/geometry/helpers';
import modelHelpers from '../store/modules/models/helpers';
import createFaceFromPoints from '../store/modules/geometry/actions/createFaceFromPoints';
import methods from './Grid/methods';
import idFactory from './../store/utilities/generateId';
import generateColor from './../store/utilities/generateColor';

export default {
  name: 'SpeedTree',
  props: ['styles', 'objectTypes'],
  data() {
    return {
      expanded: [0],
      spaceExpanded: [],
      storyHeight: 8,
      shadingHeight: 8,
      spaceType: null,
      expandSpaceTypes: false,
      shadingExpanded: [],
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
      return Math.abs(geometryHelpers.areaOfSelection(this.currentStoryGeomDenorm.vertices));
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
  methods: {
    selectStory(story) {
      this.$store.dispatch('application/setCurrentStoryId', { id: story.id });
    },
    addSpaceType(e) {
      this.$store.commit('models/updateSpaceWithData', { space: this.currentSubSelection, type: e.target.value });
      this.expandSpaceTypes = false;
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
    updateStoryHeight(e) {
      console.log(e);
    },
    treeSpaceArea(id) {
      console.log(id)
      console.log(this.spacesArea)
      if (!this.spacesArea) return '0';
      if (this.spacesArea[id] < 0) return -(this.spacesArea[id]);
      return Math.abs(this.spacesArea[id]);
    },
    treeShadeArea(id) {
      if (!this.shadingArea) return '0';
      if (this.shadingArea[id] < 0) return -(this.shadingArea[id]);
      return Math.abs(this.shadingArea[id]);
    },
    cloneStory(story) {
      this.$store.dispatch('application/setCurrentStoryId', { id: story.id });
      const { clonedGeometry, idMap } = replaceIdsForCloning(this.currentStoryGeom);
      const { clonedStory } = modelHelpers.replaceIdsUpdateInfoForCloning(story, idMap, this.state);
      this.createObject('Story');
      this.destroyObject('spaces', this.currentStory.spaces[0]);
      this.$store.dispatch('models/cloneStory', clonedStory);
      this.$store.dispatch('geometry/cloneStoryGeometry', clonedGeometry);
    },
    // REPEATED
    subselectionType: {
      get() { 
        return this.$store.state.application.currentSelections.subselectionType; 
        },
      set(sst) { 
        this.$store.dispatch('application/setCurrentSubselectionType', { subselectionType: sst }); 
        },
    },
    // REPEATED
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
    SpaceIconSpeed,
    ...svgs,
  },
};
</script>
<style lang="scss" scoped>
@import "./../scss/main.scss";

#speedNavigation {
  height: 100%;
  font-size: 75%;
  display: flex;
  flex-direction: column;
  background-color: #4EACEA;
  color: black;
  a {
    color: black;
  }
}

.tree-container {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  background-color: white;
  width: 85%;
  align-content: center;
  overflow-y: scroll;
  height: 60%;
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
  display: flex !important;
  flex-direction: column !important;
  justify-items: center !important;
  justify-content: center !important;
  align-items: center !important;
  color: black !important;
  width: 100%;
  a {
    color: black;
  }
  div:nth-child(5), div:nth-child(6) {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-self: flex-end;
    min-width: 100%;
    margin: 1%;
    align-items: center;
    .area {
      background-color: white;
      padding: 1% 5% 1% 5%;
      border: 2px solid gray;
    }
  }
}
.control-button {
  width: 40%;
  padding-top: 3%;
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
  color: white;
  max-width: 75px;
  padding: 0;
}

.tree-button {
  max-height: 14px;
}

svg.button.tree-button {
  width: 1.5rem;
}

</style>
