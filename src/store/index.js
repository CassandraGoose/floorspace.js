import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

// modules
import applicationP from './modules/application/index';
import project from './modules/project/index';
import geometry from './modules/geometry/index';
import models from './modules/models/index';

import exportData from './utilities/export';
import importFloorplan from './utilities/importFloorplan';
import importLibrary from './utilities/importLibrary';
import { convertState } from './utilities/unitConversion';
import mutations from './mutations';

Vue.use(Vuex);

export default function createStore(eventBus) {
  return applicationP.then(application =>
    new Vuex.Store(_.cloneDeep({
      strict: process.env.NODE_ENV !== 'production',
      modules: {
        application,
        project,
        geometry,
        models,
      },
      getters: {
        exportData,
        eventBus: () => eventBus,
      },
      actions: {
        importFloorplan,
        importLibrary,
        changeUnits(context, { newUnits }) {
          const oldUnits = context.state.project.config.units;
          console.log(`moving from ${oldUnits} to ${newUnits}`);
          if (oldUnits !== 'ip' && oldUnits !== 'si') {
            console.error(`Expected data.project.config.units to be "ip" or "si", received "${oldUnits}"`);
          }
          if (newUnits !== 'ip' && newUnits !== 'si') {
            console.error(`Expected oldUnits to be "ip" or "si", received "${newUnits}"`);
          }
          context.commit(
            'changeUnits',
            convertState(
              context.state,
              oldUnits,
              newUnits));
          context.dispatch('project/setUnits', { units: newUnits });
        },
      },
      mutations,
    })),
  );
}


// export default store;
