import { API } from "./api";
import util from "./util";

export default function ({ store, fetch }) {
  return {
    getAppList(callback = function () {}, options) {
      fetch({
        url: API("app-list"),
        ...options,
        success(res) {
          let data = res.data.data;
          store.setState("session", {
            apps: util.fixAppList(data["app-list"]),
            icons: util.fixIcons(data["icons"]),
          });
          callback && callback();
        },
      });
    },
    getTermTime: (callback = function () {}, options) => {
      fetch({
        url: API("time"),
        ...options,
        // showError: true,
        success: (res) => {
          const result = res.data;
          store.setState("session", {
            time: result.data,
          });
          callback && callback();
        },
      });
    },
    getTimetable(callback = function () {}, options) {
      fetch({
        url: API("timetable"),
        showError: true,
        ...options,
        success(res) {
          const cacheStatus = store.getState("session", "cacheStatus") || {};
          cacheStatus.timetable = false;

          let data = res.data.data;
          const fixData = util.fixTimetable(data);
          const cache = {
            cacheStatus,
            timetable: data,
            timetableFixed: fixData,
            timetableToday: util.fixTimetableToday(fixData),
          };
          store.setState("session", {
            ...cache
          });
          store.setState("common", {
            cache
          });

          callback(res);
        },
        fail(res) {
          // 使用离线课表
          const cacheStatus = store.getState("session", "cacheStatus") || {};
          const cache = store.getState("common", "cache") || {};
          const cacheState = {};
          if (cache.timetable) {
            cacheState.timetable = cache.timetable;
            if (cache.timetableFixed) {
              cacheState.timetableFixed = cache.timetableFixed;
              cacheState.timetableToday = util.fixTimetableToday(
                cache.timetableFixed
              );
            }
            cacheStatus.timetable = true;
          }
          store.setState("session", {
            cacheStatus,
            ...cacheState,
          });
          callback();
        },
      });
    },
    getScore(callback = function () {}, options) {
      fetch({
        url: API("score"),
        showError: true,
        ...options,
        success(res) {
          const data = res.data.data;
          const fixedData = util.fixScore(data);
          const sortedData = Array.from(fixedData.list).sort((a, b) => {
            return b["真实成绩"] - a["真实成绩"];
          });
          store.setState("session", {
            score: fixedData,
            sortedScoreList: sortedData,
          });
          callback(res);
        },
      });
    },
    getScoreDetail(callback = function () {}, options) {
      fetch({
        url: API("scoreDetail"),
        showError: true,
        ...options,
        success(res) {
          const data = res.data.data;
          store.setState("session", {
            scoreDetail: data,
          });
          callback(res);
        },
      });
    },
    getExam(callback = function () {}, options) {
      fetch({
        url: API("exam"),
        showError: true,
        ...options,
        success(res) {
          const data = res.data.data;
          store.setState("session", {
            exam: util.fixExam(data),
          });
          callback(res);
        },
      });
    },
    getFreeroom(callback = function () {}, options) {
      fetch({
        url: API("freeroom"),
        showError: true,
        ...options,
        success(res) {
          const data = res.data.data;
          store.setState("session", {
            originalFreeroomData: data,
            freeroom: util.fixFreeroom(data),
          });
          callback(res);
        },
      });
    },
    getCard(callback = function () {}, options) {
      fetch({
        url: API("card"),
        showError: true,
        ...options,
        success(res) {
          const data = res.data.data;
          const fixedData = util.fixCard(data);
          store.setState("session", {
            card: fixedData,
            cardCost: util.fixCardCost(fixedData),
          });
          callback(res);
        },
      });
    },
    getBorrow(callback = function () {}, options) {
      fetch({
        url: API("borrow"),
        showError: true,
        ...options,
        success(res) {
          const data = res.data.data;
          store.setState("session", {
            borrow: data,
          });
          callback(res);
        },
      });
    },
    getTeacher(callback = function () {}, options) {
      fetch({
        url: API("teacher"),
        showError: true,
        ...options,
        success(res) {
          const data = res.data.data;
          store.setState("session", {
            teacher: util.fixTeacher(data),
          });
          callback(res);
        },
      });
    },
    changeTimetableTerm(targetTerm, callback = function () {}, options) {
      fetch({
        url: API("timetable"),
        method: "PUT",
        ...options,
        data: {
          term: targetTerm,
        },
        showError: true,
        success(res) {
          callback(res);
        },
      });
    },
    changeScoreTerm(targetTerm, callback = function () {}, options) {
      fetch({
        url: API("score"),
        method: "PUT",
        ...options,
        data: {
          term: targetTerm,
        },
        showError: true,
        success(res) {
          callback(res);
        },
      });
    },
    changeExamTerm(targetTerm, callback = function () {}, options) {
      fetch({
        url: API("exam"),
        method: "PUT",
        ...options,
        data: {
          term: targetTerm,
        },
        showError: true,
        success(res) {
          callback(res);
        },
      });
    },
    getAnnouncement(callback = function () {}, options) {
      fetch({
        url: API("announcement"),
        method: "GET",
        ...options,
        showError: true,
        success(res) {
          const data = res.data.data;
          store.setState("session", {
            announcement: data,
          });
          callback(res);
        },
      });
    },
  };
}
