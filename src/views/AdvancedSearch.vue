<template>
  <div id="AdvancedSearch">
    <Header @getShowMenu="getShowMenu"></Header>

    <!-- fillterBox -->
    <div class="filterBox" :class="{'showMenu':showMenu}">
      <el-input
        @keyup.native.enter="searchHandler"
        class="keywordInput"
        placeholder="請輸入關鍵字"
        v-model="keywordInput"
      ></el-input>

      <el-select
        no-data-text="無匹配資料"
        no-match-text="無匹配資料"
        class="unitSelect"
        filterable
        v-model="unitSelect"
        placeholder="請選擇單位"
        :clearable="true"
      >
        <el-option
          v-for="unit in unitsData"
          :key="unit.UntId"
          :value="unit.UntId"
          :label="unit.UntNameFull"
        ></el-option>
      </el-select>

      <el-date-picker
        class="dateSelect"
        v-model="dateSelect"
        type="daterange"
        range-separator="~"
        start-placeholder="開始日期"
        end-placeholder="结束日期"
      ></el-date-picker>

      <el-button class="searchBtn" :loading="searchLoading" @click="searchHandler" type="primary">搜尋</el-button>
    </div>

    <!-- mainTable -->
    <el-table
      header-cell-class-name="tableHeader"
      :default-sort="{prop: 'date', order: 'descending'}"
      v-if="eventsData"
      :data="eventsData"
      style="height: 650px;margin-top: 3rem;"
      border
      empty-text="暫無資料"
      class="mainTable"
    >
      <el-table-column prop="UnitCode" label="單位" width="250">
        <template slot-scope="scope">
          <span v-if="unitsData">{{unitNameFilter(scope.row.UnitCode)}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="EventName" label="活動 / 會議名稱" width="250"></el-table-column>
      <el-table-column prop="JoinUsers" label="參與人員">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :open-delay="500" placement="top-start">
            <div slot="content">
              <span
                class="userSpan"
                v-for="(user,index) in scope.row.JoinUsers"
                :key="user.Id"
              >{{index+1}}.{{user.userName }}</span>
            </div>
            <p class="textOverflow">
              <span
                class="userSpan"
                v-for="user in scope.row.JoinUsers"
                :key="user.Id"
              >{{user.userName}}</span>
            </p>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column sortable prop="EventStartDate" label="開始時間" width="180">
        <template slot-scope="scope">
          <span>{{dateFilter(scope.row.EventStartDate)}}</span>
        </template>
      </el-table-column>
      <el-table-column sortable prop="EventEndDate" label="結束時間" width="180">
        <template slot-scope="scope">
          <span>{{dateFilter(scope.row.EventEndDate)}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="EventName" label="操作" width="100">
        <template slot-scope="scope">
          <el-button @click="getEventById(scope.row.Id)" size="mini" type="primary">詳細</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- pagination -->

    <div id="Pagination" v-if="currentPage">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :pager-count="5"
        :current-page="setCurrentPage"
        :page-size="pageSize"
        @current-change="handleCurrentChange"
      ></el-pagination>
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
        <div class="dialogBox">
          <p class="boxTitle">活動描述</p>
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
        <el-button class="addToGoogleBtn" type="primary" @click="addToGoogleCalendar">新增到GOOGLE行事曆</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Header from "../components/Header";
import moment from "moment";
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
  name: "AdvancedSearch",
  components: { Header },
  data() {
    return {
      // globel data
      unitsData: "",
      eventsData: "",
      eventTypeData: "",
      // filter box
      keywordInput: "",
      unitSelect: "",
      dateSelect: "",
      searchLoading: false,
      showMenu: false,
      //   dialog
      dialogEvent: {},
      eventDailog: false,
      //   google calendar
      isLogInG: false,
      startG: "",
      endG: "",
      titleG: "",

      // pagination
      pageSize: "",
      currentPage: "",
      total: "",

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
    setCurrentPage() {}
  },
  methods: {
    async getUnits() {
      const vm = this;
      await vm.$api.GetUnits().then(res => {
        vm.unitsData = res.data;
      });
    },
    getEvents({ page, key, startDate, endDate, unitCode }) {
      const vm = this;
      let params = { page, key, startDate, endDate, unitCode };
      vm.$api.GetEventsPage(params).then(res => {
        vm.pageSize = res.data.response.PageSize;
        vm.currentPage = res.data.response.page;
        vm.total = res.data.response.dataCount;
        vm.eventsData = res.data.response.data;
        vm.searchLoading = false;
      });
    },
    getEventType() {
      const vm = this;
      vm.$api.GetEventType().then(res => {
        vm.eventTypeData = res.data;
        vm.typeCheckBox = res.data.map(type => {
          return type.EventTypeName;
        });
      });
    },
    getEventById(Id) {
      const vm = this;
      let params = {
        Id
      };
      vm.$api.GetEventById(params).then(res => {
        vm.dialogEvent = res.data.response;
        console.log(vm.dialogEvent);
        vm.$nextTick(() => {
          vm.eventDailog = true;
        });
      });
    },
    searchHandler() {
      const vm = this;
      vm.showMenu = false;
      vm.searchLoading = true;
      let page = 1;
      let key = vm.keywordInput;
      let unitCode = vm.unitSelect;
      let startDate;
      let endDate;
      if (vm.dateSelect !== null && vm.dateSelect) {
        startDate = moment(vm.dateSelect[0]).format("YYYY-MM-DD");
        endDate = moment(vm.dateSelect[1]).format("YYYY-MM-DD");
      } else {
        startDate = "";
        endDate = "";
      }
      vm.getEvents({ page, key, startDate, endDate, unitCode });
    },
    handleCurrentChange(page) {
      const vm = this;
      let key = vm.keywordInput;
      let unitCode = vm.unitSelect;
      let startDate;
      let endDate;
      if (vm.dateSelect !== null && vm.dateSelect) {
        startDate = moment(vm.dateSelect[0]).format("YYYY-MM-DD");
        endDate = moment(vm.dateSelect[1]).format("YYYY-MM-DD");
      } else {
        startDate = "";
        endDate = "";
      }
      vm.getEvents({ page, key, startDate, endDate, unitCode });
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
      console.log("authenticate");
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
      console.log("loadClient");
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
    dateFilter(date) {
      return moment(date).format("YYYY-MM-DD HH:mm");
    },
    typeName(eid) {
      const vm = this;
      return vm.eventTypeData
        .map(event => {
          return event.Id === eid ? event.EventTypeName : "";
        })
        .join("");
    },
    unitNameFilter(id) {
      const vm = this;
      return vm.unitsData.filter(unit => {
        return unit.UntId === id;
      })[0].UntNameFull;
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
    this.getEvents(1, "", "", "", "");
    this.getEventType();
    await this.getUnits();
    this.logInCheck();
  }
};
</script>

<style>
</style>