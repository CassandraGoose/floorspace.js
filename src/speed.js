import 'babel-polyfill';
import Vue from 'vue';

import timetravel from './store/timetravel';
import App from './App.vue';
import PrettySelect from './components/PrettySelect.vue';
import createStore from './store/index';

Vue.component('pretty-select', PrettySelect);

export default function renderTo(el, customStyles) {
  const eventBus = new Vue();
  // const shadow = document.querySelector(el).attachShadow({ mode: 'open' });
  // const element = document.createElement('div');
  // shadow.appendChild(element);
  createStore(eventBus).then((store) => {
    window.application = new Vue({
      store,
      // el: element,
      el,
      eventBus,
      ...App,
      data() {
        return {
          styles: customStyles,
        };
      },
    });

    timetravel.init(store);
  });
}
