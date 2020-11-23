const app = getApp();
Page({
  data: {},
  onLoad: function () {
    app.$store.connect(this, "labs");
  },
  onUnload() {
    this.disconnect()
  },
});
