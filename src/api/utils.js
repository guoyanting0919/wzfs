import router from "../router/index";
import Vue from "vue";
// 跳轉回首頁
// 登入完成後跳轉回原頁面
export const toCalendar = () => {
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("Token");
  window.localStorage.removeItem("TokenExpire");
  window.localStorage.removeItem("refreshtime");
  Vue.prototype.$notify({
    title: "登入逾期",
    message: "登入期限逾期，5秒後將自動跳轉，請重新登入!",
    type: "error",
  });

  window.setTimeout(() => {
    router.replace({
      name: "Calendar",
      query: {
        redirect: router.currentRoute.fullPath,
      },
    });
    window.location.reload();
  }, 5000);
};

// 跳轉到404頁面
export const to404Page = () => {
  router.replace({
    name: "Err404",
  });
};
