import 'babel-polyfill';
import Vue from 'vue';
import timetravel from './store/timetravel';
import App from './App.vue';
import PrettySelect from './components/PrettySelect.vue';
import createStore from './store/index';

Vue.component('pretty-select', PrettySelect);

export default function renderTo(el) {
  const eventBus = new Vue();
  createStore(eventBus).then((store) => {
    let actionCount = 0;
    store.subscribe((action) => {
      if (action) {
        actionCount += 1;
        if (actionCount >= 50) {
          actionCount = 0;
          eventBus.$emit('saveJSON');
        }
      }
    });
    store.subscribe((mutation) => {
      if (mutation) {
        const data = store.getters['exportData'];
        eventBus.$emit('sendFloorspaceJSON', data);
      }
    });

    window.application = new Vue({
      store,
      el,
      eventBus,
      ...App,
    });

    timetravel.init(store);
  });

  // possibly include store here as well so we can use getters and stuff
  return eventBus;
}
