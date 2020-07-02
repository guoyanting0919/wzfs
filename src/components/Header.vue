<template>
  <div id="Header">
    <div class="headerContainer">
      <i @click="setShowMenu" class="fas fa-bars"></i>
      <img @click="$router.push('/Calendar')" src="../assets/images/wzlogo.png" alt />
      <div class="btnBox">
        <!-- <el-button v-if="!userName" @click="loginDialog=true" size="mini" type="info">登入</el-button>
        <el-button v-if="userName" @click="logoutHandler" size="mini" type="info">登出</el-button>
        <p class="userName" v-if="userName">{{userName}}</p>-->
        <i :class="{'loginIcon':userName}" class="fas fa-user"></i>
        <p v-if="!userName" class="loginBox" @click="loginDialog=true">登入帳號</p>
        <p v-if="userName" class="userName">{{userName}}</p>
        <p @click="logoutHandler" class="logoutBox" v-if="userName">登出</p>
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
        <el-input id="account" class="loginInput" v-model="account" placeholder="請輸入帳號"></el-input>
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
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="loginDialog = false">取 消</el-button>
        <el-button type="primary" @click="loginHandler">登 入</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      loginDialog: false,
      account: "admin",
      password: "0000000",
      showMenu: false
    };
  },
  computed: {
    userName() {
      if (window.localStorage.getItem("user")) {
        return JSON.parse(window.localStorage.getItem("user")).LoginName;
      } else {
        return "";
      }
    }
  },
  methods: {
    loginHandler() {
      const vm = this;
      let params = {
        account: vm.account,
        password: vm.password
      };
      vm.$api.GetToken(params).then(res => {
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
      });
    },
    getInfoByToken(token) {
      const vm = this;
      let params = {
        token
      };
      vm.$api.GetInfoByToken(params).then(res => {
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
        type: "warning"
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
    }
  }
};
</script>

<style lang='scss'>
</style>