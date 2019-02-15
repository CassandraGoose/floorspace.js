import 'babel-polyfill';
import Vue from 'vue';
import store from './store/index';

import timetravel from './store/timetravel';
import App from './App.vue';
import PrettySelect from './components/PrettySelect.vue';
import GenericInput from './components/GenericInput.vue';
import speedStyles from './speedStyles';

Vue.component('pretty-select', PrettySelect);
Vue.component('generic-input', GenericInput);

export default function renderTo(el) {
  window.eventBus = new Vue();

  window.application = new Vue({
    store,
    el,
    template: '<App :styles="styles"/>',
    components: { App },
    data() {
      return {
        styles: speedStyles,
      };
    },
  });

  timetravel.init(store);
}
