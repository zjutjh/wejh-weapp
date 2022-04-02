import logger from "../../utils/logger";

import { getInfoFromTerm } from "../../utils/termPicker";

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

    this.observe("session", "timetable");

    this.observe("session", "cardCost");
    this.observe("session", "borrow");

    this.bootstrap();
  },
  onShow() {
    app.badgeManager.updateBadgeForTabBar();
  },
  onHide() {},
  onUnload() {
    this.disconnect();
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
