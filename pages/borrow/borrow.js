const app = getApp();

Page({
  data: {
    sort: false,
    sortAnimation: false,
    hideScore: false,
    hideInfo: false,
    showLoading: true,
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
      this.getBorrow(this.afterGetBorrow, {
        back: true,
      });
    } else {
      this.afterGetBorrow();
    }
  },
  onUnload() {
    this.disconnect();
  },
  getBorrow(callback = this.afterGetBorrow, option = {}) {
    app.services.getBorrow(callback, {
      showError: true,
      ...option,
    });
  },
  afterGetBorrow() {
    this.setPageState({
      showLoading: false,
    });
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
