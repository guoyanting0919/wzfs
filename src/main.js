import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import api from "./api/apis";
import axios from "axios";
// import GAuth from "vue-google-oauth2";
import VueAxios from "vue-axios";
import ElementUI from "element-ui";
import CKEditor from "@ckeditor/ckeditor5-vue";
import "element-ui/lib/theme-chalk/index.css";

Vue.use(VueAxios, axios);
Vue.use(ElementUI);
Vue.use(CKEditor);

// all(建議放套件Css下層)
import "../src/assets/all.scss";

Vue.config.productionTip = false;
Vue.prototype.$api = api;

// const gauthOption = {
//   clientId:
//     "1029849860188-2p6ecjh0egiiukqcn6cvesanckp4iqg0.apps.googleusercontent.com",
//   scope: "https://www.googleapis.com/auth/calendar.events",
//   prompt: "consent",
// };

// Vue.use(GAuth, gauthOption);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
