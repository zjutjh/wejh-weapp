import { API } from "./api";

import util from "./util";
import termUtil from "./termPicker";

import logger from "./logger";

import dayjs from "../libs/dayjs/dayjs.min.js";

export default function ({ store, fetch }) {
  const updateLoggedInState = () => {
    if (
      store.getState("session", "token") &&
      store.getState("session", "time")
    ) {
      store.setState("session", { isLoggedIn: true });
    }
  };
  return {
    autoLogin(callback = function () {}, options) {
      fetch({
        url: API("autoLogin"),
        method: "POST",
        showError: true,
        ...options,
        success: (res) => {
          const result = res.data;
          if (result.errcode > 0) {
            const { token, user: userInfo } = result.data;
            store.setState("session", {
              token: token,
              userInfo: userInfo,
            });
            updateLoggedInState();
            callback && callback(res);
          }
        },
      });
    },
    getOpenId(callback = function () {}, options) {
      fetch({
        url: API("code"),
        method: "POST",
        showError: true,
        ...options,
        success: (res) => {
          const result = res.data;
          const openId = result.data.openid;
          store.setState("common", {
            openId,
          });
          callback && callback(res);
        },
      });
    },
    getBootstrapInfo(callback = function () {}, options) {
      fetch({
        url: API("bootstrap"),
        showError: true,
        ...options,
        success(res) {
          let data = res.data.data;
          store.setState("session", {
            apps: util.fixAppList(data.appList["app-list"]),
            icons: util.fixIcons(data.appList.icons),
            announcement: data.announcement,
            badges: data.badges,
            time: data.termTime,
          });
          updateLoggedInState();
          callback && callback(res);
        },
      });
    },
    getAppList(callback = function () {}, options) {
      fetch({
        url: API("app-list"),
        showError: true,
        ...options,
        success(res) {
          let data = res.data.data;
          store.setState("session", {
            apps: util.fixAppList(data["app-list"]),
            icons: util.fixIcons(data["icons"]),
          });
          callback && callback(res);
        },
      });
    },
    getTermTime: (callback = function () {}, options) => {
      fetch({
        url: API("time"),
        showError: true,
        ...options,
        success: (res) => {
          const result = res.data;
          store.setState("session", {
            time: result.data,
          });
          callback && callback(res);
        },
      });
    },
    getUserInfo: (callback = function () {}, options) => {
      fetch({
        url: API("user"),
        showError: true,
        ...options,
        success: (res) => {
          const result = res.data;
          const userInfo = result.data;
          store.setState("session", {
            userInfo,
          });
          callback && callback(res);
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
          };
          store.setState("session", {
            ...cache,
          });
          store.setState("common", {
            cache,
          });
          callback && callback(res);
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
              // cacheState.timetableToday = util.fixTimetableToday(
              //   cache.timetableFixed
              // );
            }
            cacheStatus.timetable = true;
            store.setState("session", {
              cacheStatus,
              ...cacheState,
            });
            callback && callback(res);
          }
        },
      });
    },
    getScore(termInfo, callback = function () {}, options) {
      /*
      cache_key: cache_score_termYear_semester (score_2020_1)
      cache: {
        last_updated: unix_stamp
        ...payload
      }
      */
      fetch({
        url: API("score"),
        showError: true,
        data: {
          term_year: termInfo.year || "",
          term_semester: termInfo.semester || "",
        },
        ...options,
        success(res) {
          const data = res.data.data;

          let scoreData = util.fixScore(data);
          const sortedList = Array.from(scoreData.list).sort((a, b) => {
            return b["真实成绩"] - a["真实成绩"];
          });

          scoreData = {
            ...scoreData,
            sortedList,
            lastUpdated: dayjs().unix(),
            isDetail: false,
          };

          store.setState("session", {
            score: scoreData,
          });

          // 写 cache, 使用响应返回的学期生成 cache key
          const termInfo = termUtil.getInfoFromTerm(scoreData.term);
          if (termInfo.year && termInfo.semester) {
            const cacheKey = `cache_score_${termInfo.year}_${termInfo.semester}`;
            logger.info("service", "写入 cache 'score', key: ", cacheKey);
            store.setState("common", {
              [cacheKey]: scoreData,
            });
          }

          callback && callback(res);
        },
        fail(res) {
          // 请求失败时返回 cache
          if (termInfo.year && termInfo.semester) {
            const cacheKey = `cache_score_${termInfo.year}_${termInfo.semester}`;
            logger.info("service", "读出 cache 'score', key: ", cacheKey);

            let cachedScore = store.getState("common", cacheKey);
            if (cachedScore) {
              // 上个版本写入 cache 的数据没有 isDetail key, 需要添加进去
              cachedScore = {
                ...cachedScore,
                isDetail: false,
              };
              store.setState("session", {
                score: cachedScore,
              });
            }
          }
          callback && callback(res);
        },
      });
    },
    getScoreDetail(termInfo, callback = function () {}, options) {
      // cache_key: cache_scoreDetail_termYear_semester (score_2020_1)
      fetch({
        url: API("scoreDetail"),
        showError: true,
        data: {
          term_year: termInfo.year || "",
          term_semester: termInfo.semester || "",
        },
        ...options,
        success(res) {
          let scoreDetail = res.data.data;

          scoreDetail = {
            ...scoreDetail,
            lastUpdated: dayjs().unix(),
            isDetail: true,
          };

          store.setState("session", {
            score: scoreDetail,
          });

          // 写 cache
          const termInfo = termUtil.getInfoFromTerm(scoreDetail.term);
          if (termInfo.year && termInfo.semester) {
            const cacheKey = `cache_scoreDetail_${termInfo.year}_${termInfo.semester}`;
            logger.info("service", "写入 cache 'score', key: ", cacheKey);
            store.setState("common", {
              [cacheKey]: scoreDetail,
            });
          }
          callback && callback(res);
        },
        fail(res) {
          // 请求失败时返回 cache
          if (termInfo.year && termInfo.semester) {
            const cacheKey = `cache_scoreDetail_${termInfo.year}_${termInfo.semester}`;
            logger.info("service", "读出 cache 'score', key: ", cacheKey);

            let cachedScoreDetail = store.getState("common", cacheKey);
            if (cachedScoreDetail) {
              // 上个版本写入 cache 的数据没有 isDetail 字段, 需要添加进去
              cachedScoreDetail = {
                ...cachedScoreDetail,
                isDetail: true,
              };
              store.setState("session", {
                score: cachedScoreDetail,
              });
            }
          }
          callback && callback(res);
        },
      });
    },
    getExam(termInfo, callback = function () {}, options) {
      fetch({
        url: API("exam"),
        showError: true,
        data: {
          term_year: termInfo.year || "",
          term_semester: termInfo.semester || "",
        },
        ...options,
        success(res) {
          const data = res.data.data;
          store.setState("session", {
            exam: util.fixExam(data),
          });
          callback && callback(res);
        },
      });
    },
    getFreeRoom(callback = function () {}, options) {
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
          callback && callback(res);
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
          callback && callback(res);
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
          callback && callback(res);
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
          callback && callback(res);
        },
      });
    },
    changeTimetableTerm(targetTerm, callback = function () {}, options) {
      fetch({
        url: API("timetable"),
        method: "PUT",
        showError: true,
        ...options,
        data: {
          term: targetTerm,
        },
        success(res) {
          callback && callback(res);
        },
      });
    },
    changeScoreTerm(targetTerm, callback = function () {}, options) {
      fetch({
        url: API("score"),
        method: "PUT",
        showError: true,
        ...options,
        data: {
          term: targetTerm,
        },
        success(res) {
          callback && callback(res);
        },
      });
    },
    changeExamTerm(targetTerm, callback = function () {}, options) {
      fetch({
        url: API("exam"),
        method: "PUT",
        showError: true,
        ...options,
        data: {
          term: targetTerm,
        },
        success(res) {
          callback && callback(res);
        },
      });
    },
    getAnnouncement(callback = function () {}, options) {
      fetch({
        url: API("announcement"),
        method: "GET",
        showError: true,
        ...options,
        success(res) {
          const data = res.data.data;
          store.setState("session", {
            announcement: data,
          });
          callback && callback(res);
        },
      });
    },
  };
}
