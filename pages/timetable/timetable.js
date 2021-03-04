import toast from "../../utils/toast";
import { getCurrentPeriod } from "../../utils/schedule";

import dayjs from "../../libs/dayjs/dayjs.min.js";
import dayjs_customParseFormat from "../../libs/dayjs/plugin/customParseFormat.js";

dayjs.extend(dayjs_customParseFormat);

const app = getApp();

const timeline = {
  //课程时间与指针位置的映射，{begin:课程开始,end:结束时间,top:指针距开始top格数}
  c0: { beginTop: -4, endTop: -4 }, //休息
  c1: { beginTop: 0, endTop: 100 },
  c1p: { beginTop: 100, endTop: 100 }, //下课
  c2: { beginTop: 100, endTop: 200 },
  c2p: { beginTop: 200, endTop: 200 }, //下课
  c3: { beginTop: 200, endTop: 300 },
  c3p: { beginTop: 300, endTop: 300 }, //下课
  c4: { beginTop: 300, endTop: 400 },
  c4p: { beginTop: 400, endTop: 400 }, //下课
  c5: { beginTop: 400, endTop: 500 },
  c5p: { beginTop: 500, endTop: 500 }, //休息，午饭
  c6: { beginTop: 500, endTop: 600 },
  c6p: { beginTop: 600, endTop: 600 }, //下课
  c7: { beginTop: 600, endTop: 700 },
  c7p: { beginTop: 700, endTop: 700 }, //下课
  c8: { beginTop: 700, endTop: 800 },
  c8p: { beginTop: 800, endTop: 800 }, //下课
  c9: { beginTop: 800, endTop: 900 },
  c9p: { beginTop: 900, endTop: 900 }, //休息，晚饭
  c10: { beginTop: 900, endTop: 1000 },
  c10p: { beginTop: 1000, endTop: 1000 }, //下课
  c11: { beginTop: 1000, endTop: 1100 },
  c11p: { beginTop: 1100, endTop: 1100 }, //下课
  c12: { beginTop: 1100, endTop: 1200 },
  c12p: { beginTop: 1200, endTop: 1200 }, //休息
};

Page({
  data: {
    weekday: ["日", "一", "二", "三", "四", "五", "六", "日"],
    _weeks: [
      "未开学",
      "第一周",
      "第二周",
      "第三周",
      "第四周",
      "第五周",
      "第六周",
      "第七周",
      "第八周",
      "第九周",
      "第十周",
      "十一周",
      "十二周",
      "十三周",
      "十四周",
      "十五周",
      "十六周",
      "十七周",
      "十八周",
      "十九周",
      "二十周",
    ],

    viewStatus: 0,
    originWeek: 0,
    currentWeek: 1,
    currentTerm: "",
    timelineTop: 0,
    timelineLeft: 36,
    conflictLessons: [],

    targetLessons: [], // 悬浮的课程
    targetLessonInfo: {},
    targetIndex: 0,
    detailIndex: 0,

    timetable: null,
  },
  onLoad: function () {
    app.$store.connect(this, "timetable");
    this.observe("session", "timetable", "originalTimetableData");
    this.observe("session", "timetableFixed", "timetable");
    this.observe("session", "userInfo");
    this.observe("session", "time");
    this.observe("session", "cacheStatus");
    this.observe("session", "isLoggedIn");

    this.startTimelineMoving();

    // 判断是否登录
    if (!this.data.isLoggedIn) {
      return wx.redirectTo({
        url: "/pages/login/login",
      });
    }

    const time = this.data.time || {};
    this.setPageState({
      viewStatus: time.week,
      originWeek: time.week || 1,
      currentWeek: time.week || 1,
    });

    // 判断是否登录
    if (!this.data.isLoggedIn) {
      return wx.redirectTo({
        url: "/pages/login/login",
      });
    }

    // 判断是否绑定正方
    if (!this.data.userInfo.ext.passwords_bind.zf_password) {
      return wx.redirectTo({
        url: "/pages/bind/zf",
      });
    }

    // 判断是否有课表数据
    if (!this.data.timetable) {
      app.services.getTimetable(
        () => {
          this.afterGetTimetable();
        },
        {
          showError: true,
          fail: () => {
            this.afterGetTimetable();
          },
        }
      );
    } else {
      this.afterGetTimetable();
    }
  },
  onUnload() {
    this.disconnect();
  },
  setTitleTerm(term) {
    wx.setNavigationBarTitle({
      title: term + " 课程表",
    });
  },
  startTimelineMoving() {
    const _this = this;
    const currentPeriod = getCurrentPeriod();
    const periodTimeline = timeline[currentPeriod.key];

    const timelineTop = Math.round(
      periodTimeline.beginTop +
        ((periodTimeline.endTop - periodTimeline.beginTop) *
          dayjs().diff(dayjs(currentPeriod.begin, "H:mm"), "minute")) /
          100
    );
    _this.setPageState({
      timelineTop,
      timelineLeft: 36 + (_this.data.time.day - 1) * 130,
    });

    setTimeout(() => {
      _this.startTimelineMoving();
    }, 60 * 1000);
  },
  showLessonDetail(e) {
    const dataset = e.currentTarget.dataset || {};
    const day = dataset.day;
    const lesson = dataset.lesson;
    const targetLessons = this.data.timetable[day][lesson].filter((item) => {
      return item["周"][this.data.currentWeek] || this.data.viewStatus === "*";
    });

    this.setPageState({
      targetLessons,
      targetLessonInfo: {
        weekday: `星期${this.data.weekday[day + 1]}`,
        lessonTime: `${lesson + 1}-${targetLessons[0]["节数"] + lesson}节`,
      },
    });
  },
  hideDetail(e) {
    if (e.target.dataset.type === "mask") {
      this.setPageState({
        targetIndex: 0,
        targetLessons: [],
        targetLessonInfo: {},
      });
    }
  },
  contactTeacher(event) {
    const dataset = event.currentTarget.dataset || {};
    const cid = dataset.cid || 0;
    const lessonInfo = this.data.targetLessons
      ? this.data.targetLessons[cid]
      : {};
    const teacherName = lessonInfo["老师"] || "";
    if (!teacherName) {
      toast({
        icon: "error",
        title: "发生了一点错误，请反馈给管理员",
      });
    } else {
      const teachers = teacherName.split(",");
      if (teachers.length === 1) {
        wx.navigateTo({
          url: "/pages/teacher/teacher?name=" + teacherName,
        });
      } else {
        wx.showActionSheet({
          itemList: teachers,
          success({ tapIndex }) {
            wx.navigateTo({
              url: "/pages/teacher/teacher?name=" + teachers[tapIndex],
            });
          },
        });
      }
    }
  },
  onSwiper(e) {
    const index = e.detail.current;
    this.setPageState({
      targetIndex: index,
    });
  },
  afterGetTimetable() {
    // this.setPageState({
    // showLoading: false,
    // });
    try {
      const originalTimetableData = this.data.originalTimetableData;
      const term = originalTimetableData.term;
      this.getConflictLessons();
      this.setPageState({
        currentTerm: term,
      });
      this.setTitleTerm(term);
    } catch (e) {
      console.error(e);
      toast({
        icon: "error",
        title: e.message,
      });
    }
  },
  getConflictLessons() {
    const timetable = this.data.timetable;
    const isConflictMap = [];
    const conflictLessons = [];
    // 开始循环周, i: 星期
    for (let i = 0; i < timetable.length; i++) {
      isConflictMap[i] = [];
      conflictLessons[i] = [];
      const dayLessons = timetable[i];
      // 开始循环节, k: 节
      for (let j = 0; j < dayLessons.length; j++) {
        isConflictMap[i][j] = [];
        conflictLessons[i][j] = [];
        let lesson = timetable[i][j];
        // 开始循环每节课
        for (let k = 0; k < lesson.length; k++) {
          let item = timetable[i][j][k];
          const weekStatus = item["周"];
          weekStatus.forEach((status, index) => {
            conflictLessons[i][j][index] =
              isConflictMap[i][j][index] === true && status;
            isConflictMap[i][j][index] = status;
          });
          conflictLessons[i][j][0] = lesson.length > 1;
        }
      }
    }

    this.setPageState({
      conflictLessons,
    });
  },
  backCurrentWeek() {
    this.setPageState({
      currentWeek: this.data.time.week,
    });
  },
  switchWeek(e) {
    const direction = e.currentTarget.dataset.direction;
    let dValue = 0;
    if (direction === "left") {
      dValue = this.data.currentWeek === 1 ? 0 : -1;
    } else if (direction === "right") {
      dValue = this.data.currentWeek === 20 ? 0 : 1;
    }
    this.setPageState({
      currentWeek: this.data.currentWeek + dValue,
    });
  },
  switchTerm(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const term = this.data.currentTerm;
    const termArr = term.match(/(\d+)\/(\d+)\((\d)\)/);

    let targetTerm;
    if (dataset.direction === "left") {
      if (+termArr[3] === 1) {
        targetTerm =
          parseInt(termArr[1]) - 1 + "/" + (parseInt(termArr[2]) - 1) + "(2)";
      } else {
        targetTerm = parseInt(termArr[1]) + "/" + parseInt(termArr[2]) + "(1)";
      }
    } else if (dataset.direction === "right") {
      if (+termArr[3] === 1) {
        targetTerm = parseInt(termArr[1]) + "/" + parseInt(termArr[2]) + "(2)";
      } else {
        targetTerm =
          parseInt(termArr[1]) + 1 + "/" + (parseInt(termArr[2]) + 1) + "(1)";
      }
    }
    wx.showLoading({
      title: "切换学期中",
    });
    app.services.changeTimetableTerm(targetTerm, (res) => {
      const data = res.data.data;
      const classTerm = data["class_term"];
      app.services.getTimetable(() => {
        wx.hideLoading();
        _this.afterGetTimetable();
      });
    });
  },
  switchView() {
    this.setPageState({
      viewStatus: this.data.viewStatus === "*" ? this.data.currentWeek : "*",
    });
  },
});
