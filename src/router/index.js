import Vue from "vue";
import VueRouter from "vue-router";

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
    redirect: "/Err404",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 };
  },
});

export default router;
