import router from "../router/index";
import Vue from "vue";
import store from "../store/index";

// 跳轉回首頁
// 登入完成後跳轉回原頁面
export const toCalendar = () => {
  let timerInterval;
  store.dispatch("loadingHandler", false);
  window.localStorage.removeItem("userf");
  window.localStorage.removeItem("Tokenf");
  window.localStorage.removeItem("TokenExpire");
  window.localStorage.removeItem("refreshtime");
  Vue.prototype.$swal({
    title: "帳號時效逾期,請重新登入",
    html: "頁面將於 <b></b> ms後跳轉",
    timer: 3000,
    timerProgressBar: true,
    onBeforeOpen: () => {
      Vue.prototype.$swal.showLoading();
      timerInterval = window.setInterval(() => {
        const content = Vue.prototype.$swal.getContent();
        if (content) {
          const b = content.querySelector("b");
          if (b) {
            b.textContent = Vue.prototype.$swal.getTimerLeft();
          }
        }
      }, 100);
    },
    onClose: () => {
      clearInterval(timerInterval);
      router.replace({
        name: "Calendar",
        query: {
          redirect: router.currentRoute.fullPath,
        },
      });
      window.location.reload();
    },
  });
};

// 跳轉到404頁面
export const to404Page = () => {
  router.replace({
    name: "Err404",
  });
};
