import _ from 'lodash';
import map, { assignableProperties } from './appconfig';
import geometryHelpers from '../geometry/helpers';

export function displayNameForMode(mode) {
  return map.modes[mode];
}

const helpers = {
  // TODO: refactor
  // returns the displayName for a given mode
  displayNameForMode,
  config: map,
};
export default helpers;


export function componentInstanceById(currStory, compInstId) {
  const windew = _.find(currStory.windows, { id: compInstId });
  if (windew) { return { ...windew, type: 'windows' }; }

  const dc = _.find(_.flatMap(currStory.spaces, s => s.daylighting_controls), { id: compInstId });
  if (dc) { return { ...dc, type: 'daylighting_controls' }; }

  const door = _.find(currStory.doors, { id: compInstId });
  if (door) { return { ...door, type: 'doors' }; }

  return null;
}

export function spacePropertyById(library, spacePropId) {
  let type, prop;
  assignableProperties.some((ap) => {
    if ((prop = _.find(library[ap], { id: spacePropId }))) {
      type = ap;
    }
    return !!prop;
  });

  return prop ? { ...prop, type } : null;
}

export function getArea(faces, type, rootState) {
  if (faces.length === 0) return null;
  const areaList = {};
  faces.forEach((face) => {
    const faceMatchedToSpace = _.flatMap(rootState.models.stories, story => story[type]).find(item => item.face_id === face.id);
    areaList[faceMatchedToSpace.id] = geometryHelpers.areaOfSelection(face.vertices);
  });
  return areaList;
}

export function getFaces(type, rootState, rootGetters) {
  const spaceFaceIds = _.flatMap(rootState.models.stories, story => story[type]).map(item => item.face_id);
  const faces = _.flatMap(rootGetters['geometry/denormalized'], geom => geom.faces).filter(face => spaceFaceIds.includes(face.id));
  return faces;
}
