import req from "./https";

// 全域 api 掛載於 Vue.prototype
// 使用方式 this.$api
// api 命名原則 首字大寫爾後駝峰
const api = {
  // login
  GetToken(params) {
    return req("get", `Login/GetClientToken`, params);
  },
  GetInfoByToken(params) {
    return req("get", "Login/GetInfoByToken", params);
  },

  // event type
  GetEventType() {
    return req("get", "Client/GetEventTypeList");
  },

  // events
  GetEvents(params) {
    return req("get", "Client/GetEventList", params);
  },
  GetEventById(params) {
    return req("get", "Client/GetEventById/Id", params);
  },
};

export default api;
