import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";
import { toCalendar } from "../api/utils";

// 防止重複點擊相同router噴error
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const routes = [
  {
    path: "/Calendar", //開頭大寫
    name: "Calendar", //開頭大寫
    component: () => import("../views/Calendar.vue"),
    meta: {
      title: "行事曆", //中文為主 若為英文開頭大寫
      requireAuth: false, //表示是否登入驗證 false 時可省略
      NoNeedHome: false, // 表示不需要父層模板 false 時可省略
    },
  },

  {
    path: "/AdvancedSearch", //開頭大寫
    name: "AdvancedSearch", //開頭大寫
    component: () => import("../views/AdvancedSearch.vue"),
    meta: {
      title: "進階搜尋", //中文為主 若為英文開頭大寫
      requireAuth: true, //表示是否登入驗證 false 時可省略
      NoNeedHome: false, // 表示不需要父層模板 false 時可省略
    },
  },

  {
    path: "/Err404",
    name: "Err404",
    component: () => import("../views/Err404.vue"),
    meta: {
      title: "404頁面",
      requireAuth: false,
      NoNeedHome: false,
    },
  },

  // 不存在的路由跳轉
  {
    path: "*",
    redirect: "/Calendar",
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 };
  },
});

router.beforeEach((to, from, next) => {
  // console.log(store);
  // 設定網頁 title
  if (to.meta.title) {
    document.title = `文藻行事曆-${to.meta.title}`;
  }

  // 檢查 token
  {
    if (!store.state.token) {
      if (window.localStorage.Token) {
        store.commit("SAVE_TOKEN", window.localStorage.Token);
        Vue.prototype.$api
          .CheckTokenExpire({ token: store.state.token })
          .then((res) => {
            let flag = res.data.response;
            if (flag) {
              console.log("token OOOO");
            } else {
              console.log("token XXXXX");
              toCalendar();
            }
          });
      } else {
        console.log("LOCAL NO TOKEN");
      }
    }
    if (!store.state.tokenExpire) {
      store.commit("SAVE_TOKEN_EXPIRE", window.localStorage.TokenExpire);
    }

    // 判斷該路由是否需要登入權限
    if (to.meta.requireAuth) {
      if (store.state.token && store.state.token != undefined) {
        // 通過vuex state獲取當前的token是否存在
        next();
      } else {
        store.commit("SAVE_TOKEN", "");
        store.commit("SAVE_TOKEN_EXPIRE", "");
        window.localStorage.removeItem("user");

        Vue.prototype.$notify({
          title: "提醒",
          message: "請先登入帳號",
          type: "warning",
        });

        next({
          path: "/Calendar",
          // query: { redirect: to.fullPath },
        });

        // window.location.reload();
      }
    } else {
      next();
    }
  }

  // 檢查 router 設置
});

export default router;
