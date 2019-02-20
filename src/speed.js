import 'babel-polyfill';
import Vue from 'vue';
import store from './store/index';

import timetravel from './store/timetravel';
import App from './App.vue';
import PrettySelect from './components/PrettySelect.vue';

Vue.component('pretty-select', PrettySelect);

export default function renderTo(el, styles) {
  // window.eventBus = new Vue();

  window.application = new Vue({
    store,
    el,
    template: '<App :styles="styles"/>',
    components: { App },
    data: { styles },
  });

  timetravel.init(store);
}
