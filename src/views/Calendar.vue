<template>
  <div id="Calendar">
    <Header @getShowMenu="getShowMenu"></Header>
    <div class="filterBox" :class="{'showMenu':showMenu}">
      <template v-for="item in eventTypeData">
        <label :for="item.Id" :key="item.Id">
          <input
            class="typeCheckBox"
            :value="item.EventTypeName"
            v-model="typeCheckBox"
            type="checkbox"
            :id="item.Id"
          />
          <span :class="{ activeSelect: checkIncludes(item.EventTypeName) }" class="checkedType">
            {{ item.EventTypeName }}
            <i class="fas fa-times-circle cross"></i>
          </span>
        </label>
      </template>
      <el-input
        @keydown.native.enter="searchHandler"
        class="searchInput"
        placeholder="請輸入關鍵字"
        v-model="searchInput"
      >
        <i @click="searchHandler" slot="suffix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <el-button
        @click="$router.push('/AdvancedSearch')"
        type="primary"
        class="adSearch"
        v-if="isLogin"
      >進階搜尋</el-button>
    </div>

    <!-- calendar -->
    <div id="fullCalendar">
      <FullCalendar
        v-if="eventData"
        class="wzCalendar"
        defaultView="dayGridMonth"
        :plugins="calendarPlugins"
        :weekends="true"
        :events="eventFilter"
        :eventLimit="true"
        height="parent"
        :allDaySlot="false"
        :displayEventEnd="true"
        @eventRender="this.eventRender"
        @datesRender="this.datesRender"
        ref="fullCalendar"
        :allDayDefault="false"
        :header="{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }"
      />
    </div>

    <!-- eventDailog -->
    <el-dialog custom-class="eventDailog" :visible.sync="eventDailog">
      <div slot="title" class="header-title">
        <span class="eventTitle">{{dialogEvent.EventName}}</span>
        <span v-if="eventTypeData" class="typeName">{{typeName(dialogEvent.EventTypeId)}}</span>
        <span class="eventUnitCode">{{dialogEvent.UnitCode}}</span>
        <el-divider></el-divider>
      </div>
      <div class="dialogMain">
        <div class="dialogBox">
          <p class="boxTitle">開始時間</p>
          <p>{{dateFilter(dialogEvent.EventStartDate)}}</p>
        </div>
        <div class="dialogBox">
          <p class="boxTitle">結束時間</p>
          <p>{{dateFilter(dialogEvent.EventEndDate)}}</p>
        </div>
        <div style="flex-wrap: wrap;" class="dialogBox">
          <p class="boxTitle">活動描述</p>
          <!-- <p class="summaryBox">{{dialogEvent.Summary}}</p> -->
          <div class="personalContainer mt-5 ck" ref="ck">
            <ckeditor
              :disabled="editorDisabled"
              :editor="editor"
              v-model="dialogEvent.Summary"
              :config="editorConfig"
            ></ckeditor>
          </div>
        </div>
        <div class="dialogBox">
          <p class="boxTitle">活動連結</p>
          <p class="noInfo" v-if="!dialogEvent.LinkUrl">暫無連結</p>
          <a class="eventLink" target="_blank" :href="dialogEvent.LinkUrl">
            <i class="fas fa-link"></i>前往連結
          </a>
        </div>
        <div class="dialogBox" v-if="dialogEvent.AttachDoc">
          <p class="boxTitle">附件下載</p>
          <p class="noInfo" v-if="dialogEvent.AttachDoc.length===0">暫無附件</p>
          <a
            v-for="(url,index) in dialogEvent.AttachDoc"
            :key="index"
            target="_blank"
            class="eventLink"
            :href="`https://scan.1966.org.tw/${url}`"
          >
            <i class="fas fa-file-download"></i>
            附件下載
          </a>
        </div>
        <div class="joinUserBox" v-if="dialogEvent.JoinUsers">
          <p class="boxTitle">參與人員</p>
          <el-table
            header-cell-class-name="tableHeader"
            empty-text="登入後查看"
            :data="dialogEvent.JoinUsers"
            style="margin-top:1rem"
          >
            <el-table-column property="userName" label="姓名"></el-table-column>
            <el-table-column property="usertitle" label="職稱"></el-table-column>
            <el-table-column property="unit" label="單位"></el-table-column>
          </el-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="eventDailog = false">取 消</el-button>
        <el-button type="primary" @click="addToGoogleCalendar">新增到GOOGLE行事曆</el-button>
      </span>
    </el-dialog>
    <!-- <el-button>默认按钮</el-button>
    <el-button type="primary">主要按钮</el-button>
    <el-button type="success">成功按钮</el-button>
    <el-button type="info">信息按钮</el-button>
    <el-button type="warning">警告按钮</el-button>
    <el-button type="danger">危险按钮</el-button>-->
  </div>
</template>

<script>
import Header from "../components/Header";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import moment from "moment";
import { Calendar } from "@fullcalendar/core";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import EssentialsPlugin from "@ckeditor/ckeditor5-essentials/src/essentials";
import BoldPlugin from "@ckeditor/ckeditor5-basic-styles/src/bold";
import ItalicPlugin from "@ckeditor/ckeditor5-basic-styles/src/italic";
import LinkPlugin from "@ckeditor/ckeditor5-link/src/link";
import ParagraphPlugin from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";
import Heading from "@ckeditor/ckeditor5-heading/src/heading.js";
import FontBackgroundColor from "@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js";
import FontColor from "@ckeditor/ckeditor5-font/src/fontcolor.js";
import FontFamily from "@ckeditor/ckeditor5-font/src/fontfamily.js";
import FontSize from "@ckeditor/ckeditor5-font/src/fontsize.js";
import MediaEmbed from "@ckeditor/ckeditor5-media-embed/src/mediaembed.js";
import List from "@ckeditor/ckeditor5-list/src/list.js";
import Image from "@ckeditor/ckeditor5-image/src/image.js";
import ImageCaption from "@ckeditor/ckeditor5-image/src/imagecaption.js";
import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize.js";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle.js";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar.js";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload.js";
import CKFinder from "@ckeditor/ckeditor5-ckfinder/src/ckfinder";
export default {
  name: "Calendar",
  components: {
    Header,
    FullCalendar
  },
  data() {
    return {
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

      //  dialog event
      eventDailog: false,
      dialogEvent: {},

      // google calendar
      isLogInG: false,
      startG: "",
      endG: "",
      titleG: "",

      // ck
      editor: ClassicEditor,
      editorConfig: {
        plugins: [
          EssentialsPlugin,
          BoldPlugin,
          ItalicPlugin,
          LinkPlugin,
          ParagraphPlugin,
          Alignment,
          Heading,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          MediaEmbed,
          List,
          Image,
          ImageResize,
          ImageUpload,
          ImageToolbar,
          ImageCaption,
          ImageStyle,
          CKFinder
        ],

        toolbar: {
          items: [
            "heading",
            "|",
            "bold",
            "italic",
            "|",
            "fontBackgroundColor",
            "fontColor",
            "fontSize",
            "|",
            "link",
            "imageUpload",
            "mediaEmbed",
            "|",
            "alignment",
            "numberedList",
            "|",
            "undo",
            "redo"
          ]
        },
        image: {
          toolbar: [
            "imageTextAlternative",
            "|",
            "imageStyle:full",
            "imageStyle:side"
          ]
        },
        ckfinder: {
          uploadUrl: `https://scan.1966.org.tw/images/Upload/Pic`,
          // 後端的上傳圖片 API 路徑
          options: {
            resourceType: "Images"
            // 限定類型為圖片
          }
        }
      },
      editorDisabled: true
    };
  },
  computed: {
    isLogin() {
      return window.localStorage.Token ? true : false;
    },
    eventFilter() {
      const vm = this;
      return vm.eventData.filter(event => {
        return vm.typeCheckBox.includes(event.EventTypeName);
      });
    }
  },
  methods: {
    getEventData({ key, startDate, endDate }) {
      const vm = this;
      let params = {
        key,
        startDate,
        endDate
      };
      vm.$api.GetEvents(params).then(res => {
        let arr = res.data.response.map(event => {
          event.title = event.EventName;
          event.end = moment(event.EventEndDate).format("YYYY-MM-DDTHH:mm:ss");
          event.start = moment(event.EventStartDate).format(
            "YYYY-MM-DDTHH:mm:ss"
          );
          return event;
        });
        vm.eventData = arr;
      });
    },
    async getEventType() {
      const vm = this;
      await vm.$api.GetEventType().then(res => {
        vm.eventTypeData = res.data;
        vm.typeCheckBox = res.data.map(type => {
          return type.EventTypeName;
        });
      });
    },
    searchHandler() {
      console.log("search");
      const vm = this;
      let startDate = vm.startDate;
      let endDate = vm.endDate;
      let key = vm.searchInput;
      vm.getEventData({ key, startDate, endDate });
    },
    checkIncludes(type) {
      return this.typeCheckBox.includes(type);
    },
    addToGoogleCalendar() {
      const vm = this;
      if (vm.isLogInG) {
        //已登入則設定參數並執行 post()
        vm.$confirm(
          `確認新增 ${vm.dialogEvent.EventName} 至Google行事曆?`,
          "提示",
          {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning"
          }
        ).then(() => {
          vm.startG = moment(vm.dialogEvent.EventStartDate).format();
          vm.endG = moment(vm.dialogEvent.EventEndDate).format();
          vm.titleG = vm.dialogEvent.EventName;
          vm.postGoogleCalendar();
        });
      } else {
        //尚未登入執行authenticate
        vm.$notify({
          title: "提醒",
          message: "請先登入Google帳號",
          type: "warning"
        });
        vm.authenticate();
      }
    },
    authenticate() {
      //若尚未登入則跳出登入視窗
      const vm = this;
      return gapi.auth2
        .getAuthInstance()
        .signIn({
          scope:
            "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
        })
        .then(
          function() {
            vm.loadClient();
          },
          function(err) {
            console.error("Error signing in", err);
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
            summary: vm.titleG
          }
        })
        .then(
          function(response) {
            vm.$notify({
              title: "成功",
              message: `已新增 ${vm.dialogEvent.EventName} 至Google行事曆`,
              type: "success"
            });
          },
          function(err) {
            console.error("Execute error", err);
          }
        );
    },
    loadClient() {
      // 設定api key 並登入
      const vm = this;
      gapi.client.setApiKey("AIzaSyApyW42vDYl7TrGihL1wYqBARlRHVS__A8");
      return gapi.client
        .load(
          "https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest"
        )
        .then(
          function() {
            vm.$notify({
              title: "登入成功",
              message: "已登入Google帳號",
              type: "success"
            });
            // console.log("GAPI client loaded for API");
            // console.log(gapi.client.hasOwnProperty("calendar"));
            vm.logInCheck();
          },
          function(err) {
            console.error("Error loading GAPI client for API", err);
          }
        );
    },
    logInCheck() {
      //檢查是否為登入狀態
      let check = gapi.hasOwnProperty("client");
      let check2 = gapi.client.hasOwnProperty("calendar");
      console.log(check2);
      check2 ? (this.isLogInG = true) : (this.isLogInG = false);
    },
    eventRender(info) {
      const vm = this;
      info.el.addEventListener("click", function() {
        let Id = info.event.extendedProps.Id;
        let params = { Id };
        vm.$api.GetEventById(params).then(res => {
          vm.dialogEvent = res.data.response;
          console.log(vm.dialogEvent);
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
        .map(event => {
          return event.Id === eid ? event.EventTypeName : "";
        })
        .join("");
    },
    dateFilter(date) {
      return moment(date).format("YYYY-MM-DD HH:mm");
    },
    getShowMenu(boolen) {
      this.showMenu = boolen;
    }
  },
  async mounted() {
    gapi.load("client:auth2", function() {
      gapi.auth2.init({
        client_id:
          "1053736036780-t7p90l1lq51th52k6cdt22onksgrl4k7.apps.googleusercontent.com"
      });
      // console.log(gapi.client.hasOwnProperty("calendar"));
    });
    const vm = this;
    this.getEventData("", "", "");
    await this.getEventType();
    this.logInCheck();
    // this.typeCheckBox = this.typeFilter;
  }
};
</script>

<style lang='scss'>
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/daygrid/main.css";
@import "~@fullcalendar/timegrid/main.css";
</style>