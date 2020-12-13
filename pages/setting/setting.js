const app = getApp();

Page({
  data: {
    hiddenName:false,
  },
  onLoad() {
    const that = this;
  },

  onShow() {
    const that = this;
    wx.getStorage({
      key: "home/setting/labs",
      success(res) {
        wx.setStorage({
          key: "home/setting",
          data: "1",
        });
      },
      fail(res) {
        wx.removeStorage({ key: "home/setting" });
        that.setData({
          hiddenName: true,
        });
      },
    });
  },
});
