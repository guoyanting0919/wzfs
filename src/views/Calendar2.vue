<template>
  <div id="Calendar2">
    <Header @getShowMenu="getShowMenu"></Header>
    <div class="filterBox" :class="{ showMenu: showMenu }">
      <template v-for="item in eventTypeData">
        <label :for="item.Id" :key="item.Id">
          <input class="typeCheckBox" :value="item.EventTypeName" v-model="typeCheckBox" type="checkbox" :id="item.Id" />
          <span :style="`background:${item.MainColor}`" :class="{ isNotActive: checkIncludes(item.EventTypeName) }" class="checkedType">
            {{ item.EventTypeName }}
            <i class="fas fa-times-circle cross"></i>
          </span>
        </label>
      </template>
      <el-input @keydown.native.enter="searchHandler" class="searchInput" placeholder="請輸入關鍵字" v-model="searchInput">
        <i @click="searchHandler" slot="suffix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <el-button @click="exportDialogVisible = true" type="primary" class="adSearch">匯出Excel</el-button>
      <el-button @click="$router.push('/AdvancedSearch')" type="primary" class="adSearch" v-if="isLogin">進階搜尋</el-button>
    </div>

    <!-- calendar -->
    <div id="fullCalendar">
      <FullCalendar v-if="eventData" locale="zh-tw" class="wzCalendar" defaultView="dayGridMonth" :plugins="calendarPlugins" :weekends="true" :events="eventFilter" :eventLimit="true" height="parent" :eventTimeFormat="eventTimeFormat" :allDaySlot="false" @eventRender="this.eventRender" @datesRender="this.datesRender" ref="fullCalendar" :allDayDefault="false" :header="{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }" />
    </div>

    <!-- eventDailog -->
    <el-dialog custom-class="eventDailog" :visible.sync="eventDailog">
      <div slot="title" class="header-title">
        <span class="eventTitle">{{ dialogEvent.EventName }}</span>
        <span v-if="eventTypeData" class="typeName">{{
          typeName(dialogEvent.EventTypeId)
        }}</span>
        <span class="eventUnitCode">{{ dialogEvent.UnitCode }}</span>
        <el-divider></el-divider>
      </div>
      <div class="dialogMain">
        <div class="dialogBox">
          <p class="boxTitle">活動地點</p>
          <p>{{ dialogEvent.EventAddr }}</p>
        </div>
        <div class="dialogBox">
          <p class="boxTitle">開始時間</p>
          <p>{{ dateFilter(dialogEvent.EventStartDate) }}</p>
        </div>
        <div class="dialogBox">
          <p class="boxTitle">結束時間</p>
          <p>{{ dateFilter(dialogEvent.EventEndDate) }}</p>
        </div>
        <div style="flex-wrap: wrap" class="dialogBox">
          <p class="boxTitle">活動描述</p>
          <vue-editor id="editor" v-model="dialogEvent.Summary"></vue-editor>
        </div>
        <div class="dialogBox">
          <p class="boxTitle">活動連結</p>
          <p class="noInfo" v-if="!dialogEvent.LinkUrl || dialogEvent.LinkUrl == ' '">
            暫無連結
          </p>
          <a class="eventLink" v-else target="_blank" :href="dialogEvent.LinkUrl">
            <i class="fas fa-link"></i>前往連結
          </a>
        </div>
        <div class="dialogBox" v-if="dialogEvent.AttachDoc">
          <p class="boxTitle">附件下載</p>
          <p class="noInfo" v-if="
              dialogEvent.AttachDoc.length === 0 ||
              dialogEvent.AttachDoc[0] == ' '
            ">
            暫無附件
          </p>
          <template v-else>
            <a v-for="(url, index) in dialogEvent.AttachDoc" :key="index" target="_blank" class="eventLink" :href="`https://cal.wzu.edu.tw/${url}`">
              <i class="fas fa-file-download"></i>
              附件下載
            </a>
          </template>
        </div>
        <div class="joinUserBox" v-if="dialogEvent.JoinUsers">
          <p class="boxTitle">參與人員</p>
          <p v-if="!isLogin" class="noInfo noJoinUser">登入後查看</p>
          <el-table v-else header-cell-class-name="tableHeader" empty-text="暫無資料" :data="dialogEvent.JoinUsers" style="margin-top: 1rem">
            <el-table-column property="userName" label="姓名"></el-table-column>
            <!-- <el-table-column
              property="usertitle"
              label="職稱"
            ></el-table-column> -->
            <el-table-column property="unit" label="單位"></el-table-column>
            <el-table-column property="userType" label="參與角色"></el-table-column>
          </el-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="eventDailog = false">取 消</el-button>
        <el-button type="primary" @click="addToGoogleCalendar">新增到GOOGLE行事曆</el-button>
      </span>
    </el-dialog>

    <!-- exportDailog -->
    <el-dialog title="匯出提示" :visible.sync="exportDialogVisible" width="30%">
      <!-- <span>請選擇匯出類別</span> -->
      <el-select clearable multiple v-model="exportType" placeholder="請選擇匯出類別">
        <el-option v-for="item in eventTypeData" :key="item.value" :label="item.EventTypeName" :value="item.Id"></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleExport">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Header from "../components/Header";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import moment from "moment";
import { VueEditor } from "vue2-editor";
import { Calendar } from "@fullcalendar/core";
import twLocale from "@fullcalendar/core/locales/zh-tw";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
export default {
  name: "Calendar",
  components: {
    Header,
    FullCalendar,
    VueEditor,
  },
  data() {
    return {
      // export
      exportDialogVisible: false,
      exportType: [],

      // baseUrl
      baseUrl: "",
      // 是否僅顯示活動
      onlyActivity: false,
      //globle data
      eventTypeData: "",
      eventData: "",

      //filter box
      searchInput: "",
      typeCheckBox: [],
      startDate: "",
      endDate: "",
      showMenu: false,

      //calendar
      calendarPlugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      eventTimeFormat: {
        hour: "numeric",
        minute: "2-digit",
        omitZeroMinute: false,
        meridiem: "narrow",
        hour12: false,
      },

      //  dialog event
      eventDailog: false,
      dialogEvent: {},

      // google calendar
      isLogInG: false,
      startG: "",
      endG: "",
      titleG: "",
    };
  },
  computed: {
    isLogin() {
      return window.localStorage.Token ? true : false;
    },
    eventFilter() {
      const vm = this;
      return vm.eventData.filter((event) => {
        return vm.typeCheckBox.includes(event.EventTypeName);
      });
    },
  },
  methods: {
    handleExport() {
      const vm = this;
      if (vm.exportType.length <= 0) {
        vm.$alertM.fire({
          icon: "error",
          title: `請選擇匯出類別`,
        });
      } else {
        let typeIds = vm.exportType.join();
        let date = moment(new Date()).format("YYYYMMDDHHMM");
        let config = {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${vm.$store.state.token}`,
          },
          responseType: "blob", //// 回應類型為 blob
        };
        this.$http
          .get(
            `${vm.baseUrl}CalendarEvent/GetCalendarExcelClient?typeIds=${typeIds}`,
            config
          )
          .then((res) => {
            // console.log(res);
            let blob = new Blob([res.data], {
              type: "application/" + res.headers["content-type"],
            });
            let downloadElement = document.createElement("a");
            let href = window.URL.createObjectURL(blob); // 創建下載的鏈接
            downloadElement.href = href;
            downloadElement.download = `行事曆事件_${date}.xlsx`; // 下載後文件名
            // 此寫法兼容可火狐瀏覽器
            document.body.appendChild(downloadElement);
            downloadElement.click(); // 點擊下載
            document.body.removeChild(downloadElement); // 下載完成移除元素
            window.URL.revokeObjectURL(href); // 釋放掉 blob 對象
            vm.$alertM.fire({
              icon: "success",
              title: `匯出成功`,
            });
            vm.exportDialogVisible = false;
          });
      }
    },
    getEventData({ key, startDate, endDate }) {
      const vm = this;
      let params = {
        key,
        startDate,
        endDate,
      };
      vm.$api.GetEvents(params).then((res) => {
        let arr = res.data.response.map((event) => {
          event.title = event.EventName;
          event.backgroundColor = event.MainColor;
          // console.log(event.EventTypeId);
          // if (event.EventTypeId == 1) {
          //   event.backgroundColor = "red";
          // } else if (event.EventTypeId == 2) {
          //   event.backgroundColor = "blue";
          // } else {
          //   event.backgroundColor = "green";
          // }

          let a = moment(event.EventEndDate).format("YYYY-MM-DD");
          let b = moment(event.EventStartDate).format("YYYY-MM-DD");
          let c;
          c = a === b ? true : false;

          event.className = c ? "isNotAllday" : "";
          event.end = moment(event.EventEndDate).format("YYYY-MM-DDTHH:mm:ss");
          event.start = moment(event.EventStartDate).format(
            "YYYY-MM-DDTHH:mm:ss"
          );

          // console.log(event.title, a, b, c);
          return event;
        });
        vm.eventData = arr;
      });
    },
    async getEventType() {
      const vm = this;
      await vm.$api.GetEventType().then((res) => {
        vm.eventTypeData = res.data;
        if (!vm.onlyActivity) {
          vm.typeCheckBox = res.data.map((type) => {
            return type.EventTypeName;
          });
        } else {
          vm.typeCheckBox = ["活動"];
        }
      });
    },
    searchHandler() {
      // console.log("search");
      const vm = this;
      let startDate = vm.startDate;
      let endDate = vm.endDate;
      let key = vm.searchInput;
      vm.getEventData({ key, startDate, endDate });
    },
    checkIncludes(type) {
      return !this.typeCheckBox.includes(type);
    },
    addToGoogleCalendar() {
      const vm = this;
      if (vm.isLogInG) {
        //已登入則設定參數並執行 post()
        vm.$swal({
          title: "新增提示",
          text: `確認新增 ${vm.dialogEvent.EventName} 至Google行事曆?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#2f3e52",
          cancelButtonColor: "#522f2f",
          confirmButtonText: "確定",
          cancelButtonText: "取消",
        }).then((result) => {
          if (result.value) {
            vm.$store.dispatch("loadingHandler", true);
            vm.startG = moment(vm.dialogEvent.EventStartDate).format();
            vm.endG = moment(vm.dialogEvent.EventEndDate).format();
            vm.titleG = vm.dialogEvent.EventName;
            vm.postGoogleCalendar();
          } else {
            vm.$store.dispatch("loadingHandler", false);
            vm.$alertT.fire({
              icon: "info",
              title: `已取消添加`,
            });
          }
        });
      } else {
        //尚未登入執行authenticate
        vm.$alertT.fire({
          icon: "info",
          title: "請先登入Google帳號",
        });
        vm.authenticate();
      }
    },
    authenticate() {
      //若尚未登入則跳出登入視窗
      const vm = this;
      vm.$store.dispatch("loadingHandler", true);
      return gapi.auth2
        .getAuthInstance()
        .signIn({
          scope:
            "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
        })
        .then(
          function () {
            vm.loadClient();
          },
          function (err) {
            console.error("Error signing in", err);
            vm.$store.dispatch("loadingHandler", false);
          }
        );
    },
    postGoogleCalendar() {
      const vm = this;
      return gapi.client.calendar.events
        .insert({
          calendarId: "primary",
          resource: {
            end: { dateTime: vm.endG },
            start: { dateTime: vm.startG },
            summary: vm.titleG,
          },
        })
        .then(
          function (response) {
            vm.$store.dispatch("loadingHandler", false);
            vm.$alertT.fire({
              icon: "success",
              title: `已新增 ${vm.dialogEvent.EventName} 至Google行事曆`,
            });
            vm.eventDailog = false;
          },
          function (err) {
            vm.$alertT.fire({
              icon: "error",
              title: `發生錯誤`,
            });
            vm.$store.dispatch("loadingHandler", false);
          }
        );
    },
    loadClient() {
      // 設定api key 並登入
      const vm = this;
      gapi.client.setApiKey(process.env.VUE_APP_API_KEY);
      return gapi.client
        .load(
          "https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest"
        )
        .then(
          function () {
            vm.$store.dispatch("loadingHandler", false);
            vm.$alertM.fire({
              icon: "success",
              title: "已成功登入Google帳號",
            });
            // console.log("GAPI client loaded for API");
            // console.log(gapi.client.hasOwnProperty("calendar"));
            vm.logInCheck();
          },
          function (err) {
            console.error("Error loading GAPI client for API", err);
          }
        );
    },
    logInCheck() {
      //檢查是否為登入狀態
      let check = gapi.hasOwnProperty("client");
      let check2 = gapi.client.hasOwnProperty("calendar");
      // console.log(check2);
      check2 ? (this.isLogInG = true) : (this.isLogInG = false);
    },
    eventRender(info) {
      const vm = this;
      // console.log(info);
      info.el.addEventListener("click", function () {
        let Id = info.event.extendedProps.Id;
        let params = { Id };
        vm.$api.GetEventById(params).then((res) => {
          vm.dialogEvent = res.data.response;
          // console.log(vm.dialogEvent);
          vm.$nextTick(() => {
            vm.eventDailog = true;
          });
        });
      });
    },
    datesRender(info) {
      const vm = this;
      // console.log(info);
      let type = info.view.viewSpec.type;
      let startDate = moment(info.view.activeStart).format("yyyy-MM-DD");
      let endDate = moment(info.view.activeEnd).format("yyyy-MM-DD");
      let key = vm.searchInput;
      vm.startDate = startDate;
      vm.endDate = endDate;
      // console.log(vm.startDate, vm.endDate, vm.getEventData);
      vm.getEventData({ key, startDate, endDate });

      // console.log(type, start, end);
    },
    typeName(eid) {
      const vm = this;
      return vm.eventTypeData
        .map((event) => {
          return event.Id === eid ? event.EventTypeName : "";
        })
        .join("");
    },
    dateFilter(date) {
      return moment(date).format("YYYY-MM-DD HH:mm");
    },
    getShowMenu(boolen) {
      this.showMenu = boolen;
    },
  },
  async mounted() {
    if (this.$route.params && this.$route.params.type) {
      this.onlyActivity = true;
    }
    this.baseUrl = process.env.VUE_APP_BASE_URL;
    this.$store.dispatch("loadingHandler", true);
    await gapi.load("client:auth2", function () {
      gapi.auth2.init({
        client_id: process.env.VUE_APP_CLIENT_ID,
      });
      // console.log(gapi.client.hasOwnProperty("calendar"));
    });
    const vm = this;
    this.getEventData("", "", "");
    await this.getEventType();
    // await this.logInCheck();
    this.$store.dispatch("loadingHandler", false);

    // this.typeCheckBox = this.typeFilter;
  },
};
</script>

<style lang="scss">
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/daygrid/main.css";
@import "~@fullcalendar/timegrid/main.css";
</style>
