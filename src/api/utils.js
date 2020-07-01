import router from "../router/index";

// 跳轉回首頁
// 登入完成後跳轉回原頁面
export const toCalendar = () => {
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("Token");
  window.localStorage.removeItem("TokenExpire");
  window.localStorage.removeItem("refreshtime");
  window.localStorage.removeItem("router");
  router.replace({
    name: "Calendar",
    query: {
      redirect: router.currentRoute.fullPath,
    },
  });
  window.location.reload();
};

// 跳轉到404頁面
export const to404Page = () => {
  router.replace({
    name: "Err404",
  });
};
