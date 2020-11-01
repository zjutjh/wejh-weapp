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
          store.setCommonState({
            apps: util.fixAppList(data["app-list"]),
            icons: util.fixIcons(data["icons"]),
          });
        },
      });
    },
    getTimetable(callback = function () {}, options) {
      const app = getApp();
      fetch({
        url: API("timetable"),
        showError: true,
        ...options,
        success(res) {
          const cacheStatus = store.getCommonState("cacheStatus") || {};
          cacheStatus.timetable = false;
          let data = res.data.data;
          const fixData = util.fixTimetable(data);
          const cache = app.get("cache") || {};
          const newState = {
            cacheStatus,
            timetable: data,
            timetableFixed: fixData,
            timetableToday: util.fixTimetableToday(fixData),
          };
          store.setCommonState(newState);
          app.set("cache", Object.assign(cache, newState));

          callback(res);
        },
        fail(res) {
          const cacheStatus = store.getCommonState("cacheStatus") || {};
          const cache = app.get("cache") || {};
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
          store.setCommonState({
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
          store.setCommonState({
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
          store.setCommonState({
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
          store.setCommonState({
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
          store.setCommonState({
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
          store.setCommonState({
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
          store.setCommonState({
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
          store.setCommonState({
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
          store.setCommonState({
            announcement: data,
          });
          callback(res);
        },
      });
    },
  };
}
