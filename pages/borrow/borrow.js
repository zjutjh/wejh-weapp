const app = getApp();

Page({
  data: {
    sort: false,
    sortAnimation: false,
    hideScore: false,
    hideInfo: false,
    // showLoading: true,
    currentTerm: "",
  },
  onLoad() {
    app.$store.connect(this, "borrow");
    this.observe("session", "borrow");
    this.observe("session", "icons");
    this.observe("session", "userInfo");
    this.observe("session", "isLoggedIn");

    // 判断是否登录
    if (!this.data.isLoggedIn) {
      return wx.redirectTo({
        url: "/pages/login/login",
      });
    }

    // 判断是否有数据
    if (!this.data.borrow) {
      this.getBorrow(this.afterGetBorrow, {});
    } else {
      this.afterGetBorrow();
    }
  },
  onUnload() {
    this.disconnect();
  },
  onPullDownRefresh() {
    this.getBorrow();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  getBorrow(callback = this.afterGetBorrow, option = {}) {
    wx.showLoading({
      title: "获取借阅信息中",
    });
    app.services.getBorrow(callback, {
      showError: true,
      ...option,
    });
  },
  afterGetBorrow() {
    wx.hideLoading();
    // this.setPageState({
    //   showLoading: false,
    // });
    // try {
    // } catch (e) {
    //   console.error(e);
    //   app.toast({
    //     icon: "error",
    //     title: e.message,
    //   });
    // }
  },
});
