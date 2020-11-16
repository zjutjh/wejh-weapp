import logger from "../../utils/logger";

const app = getApp();

Page({
  data: {
    newsTypeList: [
      {
        type: "all",
        enabled: true,
      },
      {
        type: "new",
        enabled: false,
      },
    ],
    newsTypeIndex: 0,
  },
  onLoad: function () {
    app.$store.connect(this, "news.index");
    this.observe("session", "userInfo");
    this.observe("session", "apps");
    this.observe("session", "icons");
    this.observe("session", "announcement");
    this.getData();
  },
  onUnload() {
    this.disconnect();
  },
  onClickNewsType(e) {
    const index = e.currentTarget.dataset.id;
    const targetNewsType = this.data.newsTypeList[index];
    if (targetNewsType) {
      // if (targetNewsType.enabled) {
      //
      // } else {
      app.toast({
        icon: "error",
        title: "暂未开放",
      });
      // }
    }
  },
  clipboard() {
    if (this.data.announcement && this.data.announcement.clipboard) {
      const text = this.data.announcement.clipboard;
      const tip = this.data.announcement.clipboardTip;
      wx.setClipboardData({
        data: text,
        success() {
          wx.showModal({
            title: "提示",
            icon: "success",
            showCancel: false,
            content: tip || "复制成功",
          });
        },
        fail(err) {
          logger.error("news", err);
        },
      });
    }
  },
  getData() {
    app.services.getAnnouncement();
  },
});
