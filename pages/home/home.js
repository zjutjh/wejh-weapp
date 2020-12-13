const app = getApp();

Page({
  data: {
    hiddenName: false,
    weekday: ["日", "一", "二", "三", "四", "五", "六", "日"],
    devMenuEnabled: false,
  },
  onLoad() {
    app.$store.connect(this, "home");
    this.observe("session", "userInfo");
    this.observe("session", "time");
    this.observe("static", "devMenuEnabled");
  },
  onShow() {
    const that = this;
    wx.getStorage({
      key: "home/setting",
      success(res) {
        wx.setStorage({
          key: "home",
          data: "1",
        });
      },
      fail(res) {
        wx.removeStorage({ key: "home" });
        that.setData({
          hiddenName: true,
        })
      },

      complete(res) {
        wx.getStorage({
          key: "home",
          success(res) {
            wx.showTabBarRedDot({
              index: 2,
            });
          },
          fail(res) {
            wx.hideTabBarRedDot({
              index: 2,
            });
          },
        });
      },
    });
  },

  onUnload() {
    this.disconnect();
  },
  followUs() {
    wx.setClipboardData({
      data: "zjutjh",
      success() {
        wx.showModal({
          title: "提示",
          icon: "success",
          showCancel: false,
          content: "复制成功，粘贴至微信搜索栏关注我们",
        });
      },
    });
  },
  // donate () {
  //   wx.navigateToMiniProgram({
  //     appId: app.env('geizanAppId'),
  //     path: 'pages/apps/largess/detail?id=wA3oQqX64Yg%3D'
  //   })
  // },
  userBlockClick() {
    if (!this.data.userInfo) {
      return wx.navigateTo({
        url: "/pages/login/login",
      });
    }
  },
});
