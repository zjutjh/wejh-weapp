import dayjs from "../../libs/dayjs/dayjs.min.js";
import logger from "../../utils/logger";
import { schedule } from "../../utils/schedule";
import { getInfoFromTerm } from "../../utils/termPicker";

import dayjs_customParseFormat from "../../libs/dayjs/plugin/customParseFormat.js";
import dayjs_isBetween from "../../libs/dayjs/plugin/isBetween.js";
import dayjs_duration from "../../libs/dayjs/plugin/duration.js";

dayjs.extend(dayjs_customParseFormat);
dayjs.extend(dayjs_isBetween);
dayjs.extend(dayjs_duration);

const initAppList = [];
const initApp = {
  title: "加载中",
  disabled: true,
  icon: "/images/app-list/red.png",
};
for (let i = 0; i < 10; i++) {
  initAppList.push(initApp);
}

const app = getApp();

Page({
  data: {
    tinyTip: {
      active: false,
      content: "请先登录",
    },
    apps: initAppList,
    // private
    timetableToday: null,
    _todayTimetableIntervalId: null,
  },
  onLoad() {
    app.$store.connect(this, "index");

    this.tooltip = this.selectComponent("#tooltip");
    this.announcementModal = this.selectComponent("#announcementModal");

    this.observe("session", "isLoggedIn", null, (newVal) => {
      if (newVal.isLoggedIn) {
        this.fetchHomeCards();
      }
    });

    this.observe("session", "userInfo");

    // apps 和 icons 在同一个请求得到
    this.observe("session", "apps");
    this.observe("session", "icons");

    this.observe("session", "unclearedBadges");

    this.observe("session", "announcement", null, (newValues) => {
      const { announcement } = newValues;
      if (!announcement) {
        return;
      }
      const announcementId =
        app.$store.getState("static", "announcementId") || 0;
      if (announcementId < announcement.id) {
        this.announcementModal.show();
        app.$store.setState("static", { announcementId: announcement.id });
      }
    });

    this.observe("session", "time");

    this.observe("session", "timetable", null, (newValues) => {
      const { timetable } = newValues;
      if (!timetable) {
        return;
      }
      this.updateTodayTimetable();
    });

    this.observe("session", "card");
    this.observe("session", "cardCost");
    this.observe("session", "borrow");

    this.bootstrap();

    // 后续移除该属性
    this.setPageState({
      todayTime: dayjs().format("YYYY-MM-DD"),
    });
  },
  onShow() {
    app.badgeManager.updateBadgeForTabBar();

    clearInterval(this.data._todayTimetableIntervalId);
    this.updateHintForTodayTimetable();
    this.data._todayTimetableIntervalId = setInterval(() => {
      this.updateHintForTodayTimetable();
    }, 60 * 1000);
  },
  onUnload() {
    clearInterval(this.data._todayTimetableIntervalId);
    this.disconnect();
  },
  onHide() {
    clearInterval(this.data._todayTimetableIntervalId);
  },
  updateTodayTimetable() {
    const { timetable, time } = this.data;
    if (!timetable || !time) {
      return;
    }

    const { day: weekday, week } = this.data.time;

    const todayTimetable = timetable["classes"][weekday - 1];
    const timetableToday = [];

    todayTimetable.forEach((lessons) => {
      lessons.forEach((lesson) => {
        const isAvailable = lesson["周"][week];
        if (isAvailable) {
          timetableToday.push(lesson);
        }
      });
    });

    this.setPageState({
      timetableToday,
    });

    this.updateHintForTodayTimetable();
  },
  updateHintForTodayTimetable() {
    try {
      logger.info("index", "刷新今日课表状态");

      if (!this.data.timetableToday) {
        return;
      }

      let shouldHintNextLesson = true;
      let hasInLessonHint = false;

      const timetableToday = this.data.timetableToday.map((lesson) => {
        const startTime = dayjs(schedule[`c${lesson["开始节"]}`].begin, "H:mm");
        const endTime = dayjs(schedule[`c${lesson["结束节"]}`].end, "H:mm");

        const isInLesson = dayjs().isBetween(
          startTime,
          endTime,
          "minute",
          "[]"
        );

        if (isInLesson) {
          // 正在上课
          hasInLessonHint = true;

          const duration = dayjs.duration(endTime.diff(dayjs(), true));

          const formattedHint =
            duration.asMinutes() < 60
              ? `${Math.ceil(duration.asMinutes())}分钟`
              : `${duration.format("H小时mm分")}`;

          lesson["课程提示"] = {
            icon: lesson["课程图标"],
            content: `还有${formattedHint}下课`,
            color: "blue",
          };
        } else if (shouldHintNextLesson) {
          const isBefore = dayjs().isBefore(startTime, "minute");

          if (isBefore > 0) {
            // 还没上课
            shouldHintNextLesson = false;

            const duration = dayjs.duration(startTime.diff(dayjs(), true));
            const isInOneHour = duration.asMinutes() < 60;

            lesson["课程提示"] = {
              icon: isInOneHour ? "rush" : "clock",
              content: `还有${
                isInOneHour
                  ? `${Math.ceil(duration.asMinutes())}分钟`
                  : `${duration.format("H小时mm分")}`
              }上课`,
              color: hasInLessonHint ? "" : isInOneHour ? "red" : "blue",
            };
          }
        }
        return lesson;
      });

      this.setPageState({
        timetableToday,
      });
    } catch (e) {
      wx.reportMonitor("2", 1);
      // console.error(e);
    }
  },
  bootstrap() {
    app.services.getBootstrapInfo(null, { showError: false });
  },
  fetchHomeCards() {
    if (!(this.data.time && this.data.time.term)) {
      return;
    }
    app.services.getTimetable(getInfoFromTerm(this.data.time.term), null, {
      showError: false,
    });
    app.services.getCard(null, {
      showError: false,
    });
    app.services.getBorrow(null, {
      showError: false,
    });
  },
  onPullDownRefresh() {
    this.bootstrap();
    if (!this.data.isLoggedIn) {
      // 下拉刷新应当不考虑登录问题，下个迭代进行优化
      app.wxLogin();
    }
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  // clipboard() {
  //   if (this.data.announcement && this.data.announcement.clipboard) {
  //     const text = this.data.announcement.clipboard;
  //     const tip = this.data.announcement.clipboardTip;
  //     wx.setClipboardData({
  //       data: text,
  //       success() {
  //         toast({
  //           icon: "success",
  //           title: tip || "复制成功",
  //         });
  //       },
  //     });
  //   }
  // },
  onClickApp(e) {
    const target = e.currentTarget;
    const index = target.dataset.index;

    if (!this.data.apps) {
      this.tooltip.show("应用列表信息获取失败，请重启微信再试");
      return;
    }

    const appItem = this.data.apps[index];

    if (!appItem) {
      return;
    }

    if (!this.data.isLoggedIn) {
      this.tooltip.show("请先登录");
      return;
    }
    if (appItem.disabled) {
      this.tooltip.show("服务暂不可用");
      return;
    }

    if (appItem.badge && appItem.badge.clearPath) {
      app.badgeManager.clearBadge(appItem.badge.clearPath);
    }

    if (appItem.url) {
      appItem.url = appItem.url.replace(
        encodeURIComponent("{uno}"),
        this.data.userInfo.uno
      );
      logger.info("index", "前往 webview", appItem.url);
      return wx.navigateTo({
        url:
          "/pages/webview/webview?" +
          Object.keys(appItem)
            .map((key) => key + "=" + encodeURIComponent(appItem[key]))
            .join("&"),
      });
    }
    if (appItem.module) {
      try {
        return this[appItem.module]();
      } catch (e) {
        return;
      }
    }
    if (appItem.appId) {
      return wx.navigateToMiniProgram({
        appId: appItem.appId,
        path: appItem.path,
        extraData: appItem.extraData,
        fail(err) {
          logger.warn(
            "index",
            `Failed to navigate to weApp with appId: ${appItem.appId}, error: `,
            err
          );
        },
      });
    }
    wx.navigateTo({
      url: appItem.route,
    });
  },
});
