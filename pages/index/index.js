import logger from "../../utils/logger";
import toast from "../../utils/toast";
import dayjs from "../../libs/dayjs/dayjs.min.js";

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
    helpStatus: false,
    timetableToday: null,
  },
  onLoad() {
    app.$store.connect(this, "index");

    this.tooltip = this.selectComponent("#tooltip");

    this.observe("session", "isLogin", null, (newValues) => {
      if (newValues.isLogin) {
        this.getData();
      }
    });

    this.observe("session", "userInfo");

    // apps 和 icons 在同一个请求得到
    this.observe("session", "apps");
    this.observe("session", "icons");

    this.observe("session", "announcement", null, (newValues) => {
      const { announcement } = newValues;
      if (!announcement) {
        return;
      }
      const announcementId =
        app.$store.getState("static", "announcementId") || 0;
      if (announcementId < announcement.id) {
        this.setPageState({
          helpStatus: true,
        });
        app.$store.setState("static", { announcementId: announcement.id });
      }
    });

    this.observe("session", "time");

    this.observe("session", "cacheStatus");

    this.observe("session", "timetableFixed", null, () => {
      this.updateTodayTimetable();
    });

    this.observe("session", "card");
    this.observe("session", "cardCost");
    this.observe("session", "borrow");

    // 后续移除该属性
    this.setPageState({
      todayTime: dayjs().format("YYYY-MM-DD"),
    });
  },
  onUnload() {
    this.disconnect();
  },
  hideHelp() {
    this.setPageState({
      helpStatus: false,
    });
  },
  updateTodayTimetable() {
    const { timetableFixed, time } = this.data;
    if (!timetableFixed || !time) {
      return;
    }

    const weekday = this.data.time.day;
    const week = this.data.time.week;
    const todayTimetable = timetableFixed[weekday - 1];
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
  },
  getData() {
    app.services.getAnnouncement(null, {
      showError: false,
    });
    app.services.getTermTime(
      () => {
        app.services.getAppList(
          () => {
            app.services.getTimetable(null, {
              showError: false,
            });
            app.services.getCard(null, {
              showError: false,
            });
            app.services.getBorrow(null, {
              showError: false,
            });
          },
          { showError: false }
        );
      },
      { showError: false }
    );
  },
  onPullDownRefresh() {
    if (this.data.isLogin) {
      this.getData();
    } else {
      this.tooltip.show("请先登录");
    }
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  clipboard() {
    if (this.data.announcement && this.data.announcement.clipboard) {
      const text = this.data.announcement.clipboard;
      const tip = this.data.announcement.clipboardTip;
      wx.setClipboardData({
        data: text,
        success() {
          toast({
            icon: "success",
            title: tip || "复制成功",
          });
        },
      });
    }
  },
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

    if (!this.data.isLogin) {
      this.tooltip.show("请先登录");
      return;
    }
    if (appItem.disabled) {
      this.tooltip.show("服务暂不可用");
      return;
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
      });
    }
    wx.navigateTo({
      url: appItem.route,
    });
  },
});
