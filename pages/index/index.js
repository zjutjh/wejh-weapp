import logger from "../../utils/logger";
import toast from "../../utils/toast";

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

    // 这个优化掉
    this.setPageState({
      todayTime: new Date().toLocaleDateString(),
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
  getAnnouncement() {
    app.services.getAnnouncement(
      (res) => {
        const data = res.data.data;
        const announcementId =
          app.$store.getState("static", "announcementId") || 0;
        if (announcementId < data.id) {
          this.setPageState({
            helpStatus: true,
          });
          app.$store.setState("static", { announcementId: data.id });
        }
      },
      {
        showError: false,
      }
    );
  },
  getTimetable() {
    app.services.getTimetable(undefined, {
      showError: false,
    });
  },
  getBorrow() {
    app.services.getBorrow(undefined, {
      showError: false,
    });
  },
  getCard() {
    app.services.getCard(undefined, {
      showError: false,
    });
  },
  showTip(content, duration = 1500) {
    this.setPageState({
      tinyTip: {
        active: true,
        content: content,
      },
    });

    setTimeout(() => {
      this.hideTip();
    }, duration);
  },
  hideTip() {
    this.setPageState({
      tinyTip: {
        active: false,
        content: "",
      },
    });
  },
  feedback() {
    app.goFeedback();
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
    const isLogin = app.$store.getState("session", "token");
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

    if (!isLogin) {
      return this.loginTooltip.show("请先登录");
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
