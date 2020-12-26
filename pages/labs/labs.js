const app = getApp();
Page({
  data: {},
  onLoad: function () {
    app.$store.connect(this, "labs");

    wx.removeStorage({ key: "home/setting/labs" });
  },
  onUnload() {
    this.disconnect();
  },
});
