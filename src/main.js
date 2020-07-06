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
import VueSweetalert2 from "vue-sweetalert2";

import "element-ui/lib/theme-chalk/index.css";
import "sweetalert2/dist/sweetalert2.min.css";

Vue.use(VueAxios, axios);
Vue.use(ElementUI);
Vue.use(CKEditor);
Vue.use(VueSweetalert2);

const alertT = Vue.prototype.$swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener("mouseenter", Vue.prototype.$swal.stopTimer);
    toast.addEventListener("mouseleave", Vue.prototype.$swal.resumeTimer);
  },
});

const alertM = Vue.prototype.$swal.mixin({
  toast: false,
  position: "center",
  showConfirmButton: true,
  showCloseButton: false,
  timer: 3000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener("mouseenter", Vue.prototype.$swal.stopTimer);
    toast.addEventListener("mouseleave", Vue.prototype.$swal.resumeTimer);
  },
});
// all(建議放套件Css下層)
import "../src/assets/all.scss";

Vue.config.productionTip = false;
Vue.prototype.$api = api;
Vue.prototype.$alertT = alertT;
Vue.prototype.$alertM = alertM;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
