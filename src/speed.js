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
    window.application = new Vue({
      // beforeCreate() {
      //   this.$store = store;
      // },
      store,
      el,
      eventBus,
      ...App,
    });

    timetravel.init(store);
  });
}
