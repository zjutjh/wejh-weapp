const app = getApp();

Page({
  data: {},
  onLoad: function () {
    app.$store.connect(this, "binding");
    this.observe("session", "userInfo");
  },
  onUnload() {
    this.disconnect()
  },
});
