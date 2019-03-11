import _ from 'lodash';
import geometryHelpers from '../geometry/helpers';
import { componentInstanceById, spacePropertyById } from './helpers';

export default {
  // full story object for the currentSelections story_id
  currentStory(state, getters, rootState) { console.log('trying to get currentStory', rootState.models.stories); return rootState.models.stories.find(s => s.id === state.currentSelections.story_id); },

  // full space, shading, or image object for the currentSelections subselection_id
  currentSubSelection(state, getters) {
    const currentStory = getters['currentStory'];
    if (!currentStory) { return null; }
    const subSelectionId = state.currentSelections.subselection_ids[currentStory.id];
    return currentStory.spaces.find(i => i.id === subSelectionId) ||
      currentStory.shading.find(i => i.id === subSelectionId) ||
      currentStory.images.find(i => i.id === subSelectionId) || { id: -1 };
  },
  getCurrentGridId(state) {
    // this is dumb but i don't have any other ideas rn.
    return state.currentGridId;
  },
  getCurrentSvgGridId(state) {
    return state.currentSvgGridId;
  },
  currentSubSelectionType(state, getters) {
    const currentStory = getters['currentStory'];
    if (!currentStory) { return null; }
    const subSelectionId = state.currentSelections.subselection_ids[currentStory.id];
    if (currentStory.spaces.find(i => i.id === subSelectionId)) {
      return 'spaces';
    } else if (currentStory.shading.find(i => i.id === subSelectionId)) {
      return 'shading';
    } else if (currentStory.images.find(i => i.id === subSelectionId)) {
      return 'images';
    }
    return null;
  },

  // access subSelection by type
  currentSpace(state, getters) { return getters.currentSubSelectionType === 'spaces' ? getters.currentSubSelection : null; },
  currentShading(state, getters) { return getters.currentSubSelectionType === 'shading' ? getters.currentSubSelection : null; },
  currentImage(state, getters) { return getters.currentSubSelectionType === 'images' ? getters.currentSubSelection : null; },

  // full component definition (window_definition or daylighting_control_definition) instance for the component_definition_id
  // this will be stored in the top level library
  currentComponent(state, getters, rootState) {
    const componentDefinitionId = state.currentSelections.component_definition_id;
    let type, definition;
    if ((definition = rootState.models.library.window_definitions.find(i => i.id === componentDefinitionId))) {
      type = 'window_definitions';
    } else if ((definition = rootState.models.library.daylighting_control_definitions.find(i => i.id === componentDefinitionId))) {
      type = 'daylighting_control_definitions';
    } else if ((definition = _.find(rootState.models.library.door_definitions, { id: componentDefinitionId }))) {
      type = 'door_definitions';
    }
    return { type, definition };
  },

  currentComponentDefinition(state, getters) {
    return getters['currentComponent']['definition'];
  },

  currentComponentInstance(state, getters) {
    const compDefId = state.currentSelections.component_instance_id;
    if (!compDefId) { return null; }
    return componentInstanceById(getters['currentStory'], compDefId);
  },

  currentSpaceProperty(state, getters, rootState) {
    const
      spacePropertyId = state.currentSelections.space_property_id,
      library = rootState.models.library;
    return spacePropertyById(library, spacePropertyId);
  },

  // geometry for the story being edited
  currentStoryGeometry(state, getters, rootState) {
    const currentStory = getters['currentStory'];
    if (!currentStory) { return null; }
    return rootState.geometry.find(g => g.id === currentStory.geometry_id);
  },
  currentStoryDenormalizedGeom(state, getters) {
    const currentStoryGeom = getters['currentStoryGeometry'];
    if (!currentStoryGeom) { return null; }
    return geometryHelpers.denormalize(currentStoryGeom);
  },
  allStoriesArea(state, getters, rootState) {
    const areaList = {};
    rootState.models.stories.forEach((story) => {
      const storyGeometry = rootState.geometry.find(g => g.id === story.geometry_id);
      areaList[story.id] = geometryHelpers.areaOfSelection(storyGeometry.vertices);
    });
    return areaList;
  },
  allSpacesArea(state, getters, rootState) {
    const areaList = {};
    const vertices = [];
    rootState.models.stories.forEach((story) => {
      story.spaces.forEach((space) => {
        rootState.geometry.forEach((geometry) => {
          geometry.faces.forEach((face) => {
            if (space.face_id === null) return null;
            const spaceFace = space.face_id === face.id ? face : null;
            spaceFace.edgeRefs.forEach((edgeRef) => {
              geometry.edges.forEach((edge) => {
                if (edgeRef.edge_id === edge.id) {
                  geometry.vertices.forEach((vertice) => {
                    if (vertice.id === edge.v1) vertices.push({ id: vertice.id, x: vertice.x, y: vertice.y });
                    if (vertice.id === edge.v2) vertices.push({ id: vertice.id, x: vertice.x, y: vertice.y });
                  });
                }
              });
            });
          });
        });
        areaList[space.id] = geometryHelpers.areaOfSelection(vertices);
      });
    });
    return areaList;
  },

  // face for the shading or space being edited
  currentSubSelectionFace(state, getters) {
    // if the subselection is an image, there will not be an associated face
    if (getters['currentSubSelection'] && getters['currentSubSelection'].face_id) {
      return getters['currentStoryGeometry'].faces.find(f => f.id === getters['currentSubSelection'].face_id);
    }
    return null;
  },
};
