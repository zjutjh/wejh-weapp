let app = getApp();
Page({
  data: {},
  onLoad: function () {
    app.$store.connect(this, "labs");

    wx.removeStorage({ key: "home/setting/labs" });

    // wx.getStorage({
    //   key: "home/setting/labs",
    //   success(res) {
    //     wx.setStorage({
    //       key: "home/setting",
    //       data: "1",
    //     });
    //   },
    //   fail(res) {
    //     wx.removeStorage({ key: "home/setting" });
    //   },

    //   complete(res) {
    //     wx.getStorage({
    //       key: "home/setting",
    //       success(res) {
    //         wx.setStorage({
    //           key: "home",
    //           data: "1",
    //         });
    //       },
    //       fail(res) {
    //         wx.removeStorage({ key: "home" });
    //       },
    //     });
    //   },
    // });
  },

  onUnload() {
    this.disconnect();
  },
});
