import SocketIO from 'socket.io-client';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import vueDebounce from 'vue-debounce';
import VueSocketIO from 'vue-socket.io';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import store from './store';

import { auth_service } from './services/auth.service';

Vue.config.productionTip = false;

auth_service.setGlobalAuthErrorHandler();
auth_service.setAuthNoTokenPreventer();

Vue.use(VueCookies);
Vue.use(vueDebounce);

// socket configuration options
const options = { withCredentials: true, autoConnect: true };

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

Vue.use(
  new VueSocketIO({
    debug: false,
    connection: SocketIO(process.env.VUE_APP_BASE_API_URL, options),
    vuex: {
      store,
      actionPrefix: 'SOCKET_'
    }
  })
);

new Vue({
  store,
  router,
  vuetify,
  beforeCreate() {
    auth_service.resetUser();
  },
  render: h => h(App)
}).$mount('#app');
