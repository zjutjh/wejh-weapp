import logger from "../../utils/logger";

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
    helpStatus: false,
    apps: initAppList,
  },
  onLoad() {
    app.$store.connect(this, "index");
    this.observe("session", "userInfo");
    this.observe("session", "apps");
    this.observe("session", "icons");
    this.observe("session", "time", null, this.onTimeUpdate);
    this.observe("session", "timetableFixed");
    this.observe("session", "card");
    this.observe("session", "cardCost");
    this.observe("session", "borrow");
    this.observe("session", "announcement");
    this.observe("session", "cacheStatus");
    this.getData();

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
  onTimeUpdate() {
    const timetableFixed = this.data.timetableFixed;
    if (!this.data.time) {
      return setTimeout(() => {
        app.services.getTermTime(() => {
          this.onTimeUpdate();
        });
      }, 5000);
    }
    if (!timetableFixed) {
      return setTimeout(() => {
        this.onTimeUpdate();
      }, 5000);
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
  getIndexCardData() {
    if (app.isLogin()) {
      this.getTimetable();
      this.getCard();
      this.getBorrow();
    } else {
      setTimeout(() => {
        this.getIndexCardData();
      }, 500);
    }
  },
  getData() {
    app.services.getTermTime();
    app.services.getAppList();
    this.getAnnouncement();
    this.getIndexCardData();
  },
  onPullDownRefresh() {
    if (app.isLogin()) {
      this.getData();
    } else {
      this.showTip("请先登录");
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
  clipboard() {
    if (this.data.announcement && this.data.announcement.clipboard) {
      const text = this.data.announcement.clipboard;
      const tip = this.data.announcement.clipboardTip;
      wx.setClipboardData({
        data: text,
        success() {
          app.toast({
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
      return this.showTip("应用列表信息获取失败，请重启微信再试");
    }
    const appItem = this.data.apps[index];

    if (!appItem) {
      return
    }

    if (!isLogin) {
      return this.showTip("请先登录");
    }
    if (appItem.disabled) {
      return this.showTip("服务暂不可用");
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
