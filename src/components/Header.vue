<template>
  <div id="Header">
    <div class="headerContainer">
      <i @click="setShowMenu" class="fas fa-bars"></i>
      <img
        @click="$router.push('/Calendar')"
        src="../assets/images/wzlogo.png"
        alt
      />

      <div class="btnBox">
        <i :class="{ loginIcon: userName }" class="fas fa-user"></i>
        <p v-if="!userName" class="loginBox" @click="loginDialog = true">
          登入帳號
        </p>
        <p v-if="userName" class="userName">{{ userName }}</p>

        <p @click="logoutHandler" class="logoutBox" v-if="userName">
          登出
          <a
            href="https://cal.wzu.edu.tw/wzbsDev/index.html#/Login"
            v-if="hasRole"
            class="logoutBox bsBtn"
            >後台系統</a
          >
        </p>
      </div>
    </div>

    <!-- loginDialog -->
    <el-dialog
      custom-class="loginDialog"
      title="登入"
      :visible.sync="loginDialog"
      width="350px"
      center
    >
      <label class="loginBox" for="account">
        <p>帳號</p>
        <el-input
          id="account"
          class="loginInput"
          v-model="account"
          placeholder="請輸入帳號"
        ></el-input>
      </label>
      <label class="loginBox" for="password">
        <p>密碼</p>
        <el-input
          type="password"
          id="password"
          class="loginInput"
          v-model="password"
          placeholder="請輸入密碼"
        ></el-input>
      </label>
      <div class="identifyBox">
        <div @click="refreshCode">
          <Identify :identifyCode="identifyCode"></Identify>
        </div>
        <input type="text" v-model="code" placeholder="請輸入驗證碼" />
      </div>
      <span class="changeCode">點擊圖片更新驗證碼</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="loginDialog = false">取 消</el-button>
        <el-button type="primary" @click="loginHandler">登 入</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Identify from "../components/Identify";
export default {
  name: "Header",
  components: {
    Identify,
  },
  data() {
    return {
      loginDialog: false,
      account: "",
      password: "",
      showMenu: false,

      // 數字驗證
      code: "",
      identifyCodes: "1234567890",
      identifyCode: "",
    };
  },
  computed: {
    userName() {
      if (window.localStorage.getItem("user")) {
        return JSON.parse(window.localStorage.getItem("user")).RealName;
      } else {
        return "";
      }
    },
    hasRole() {
      if (window.localStorage.getItem("user")) {
        return (
          JSON.parse(window.localStorage.getItem("user")).RoleNames[0] || false
        );
      } else {
        return false;
      }
    },
  },
  methods: {
    loginHandler() {
      const vm = this;
      if (vm.account === "" || vm.password === "") {
        vm.$alertT.fire({
          icon: "error",
          title: `請確實填寫帳號密碼`,
        });
      } else {
        if (vm.identifyCode !== vm.code) {
          vm.$alertT.fire({
            icon: "error",
            title: `驗證碼輸入錯誤`,
          });
        } else {
          let params = {
            account: vm.account,
            password: vm.password,
          };
          vm.$api
            .GetToken(params)
            .then((res) => {
              if (res.data.success) {
                let token = res.data.token;
                vm.$store.commit("SAVE_TOKEN", token);
                let curTime = new Date();
                let expiredate = new Date(
                  curTime.setSeconds(curTime.getSeconds() + res.data.expires_in)
                );
                vm.$store.commit("SAVE_TOKEN_EXPIRE", expiredate);

                window.localStorage.refreshtime = expiredate;
                window.localStorage.expires_in = res.data.expires_in;
                vm.getInfoByToken(token);
              } else {
                // console.log(res);
                vm.$alertM.fire({
                  icon: "error",
                  title: res.data.message,
                });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
    },
    getInfoByToken(token) {
      const vm = this;
      let params = {
        token,
      };
      vm.$api.GetInfoByToken(params).then((res) => {
        window.localStorage.user = JSON.stringify(res.data.response);
        vm.loginDialog = false;
        window.location.reload();
      });
    },

    logoutHandler() {
      const vm = this;
      vm.$confirm(`確認登出?`, "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        window.localStorage.removeItem("user");
        window.localStorage.removeItem("Token");
        window.localStorage.removeItem("TokenExpire");
        window.localStorage.removeItem("refreshtime");
        window.localStorage.removeItem("router");
        vm.$router.push("/Calendar");
        window.location.reload();
      });
    },
    setShowMenu() {
      this.showMenu = !this.showMenu;
      this.$emit("getShowMenu", this.showMenu);
    },
    // 生成隨機數
    randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    },
    // 切換驗證碼
    refreshCode() {
      this.identifyCode = "";
      this.makeCode(this.identifyCodes, 4);
    },
    // 生成四位隨機驗證碼
    makeCode(o, l) {
      for (let i = 0; i < l; i++) {
        this.identifyCode += this.identifyCodes[
          this.randomNum(0, this.identifyCodes.length)
        ];
      }
    },
  },
  mounted() {
    this.identifyCode = "";
    this.makeCode(this.identifyCodes, 4);
  },
};
</script>

<style lang='scss'>
</style>