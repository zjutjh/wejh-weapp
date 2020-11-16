let app = getApp();

Page({
  data: {
    wd: "",
  },
  onLoad(payload) {
    app.$store.connect(this, "teacher");
    this.observe("session", "teacher");
    this.observe("session", "icons");
    this.observe("session", "userInfo");

    setTimeout(() => {
      // 判断是否登录
      if (!app.isLogin() || !this.data.userInfo) {
        return wx.redirectTo({
          url: "/pages/login/login",
        });
      }
      if (payload && payload.name) {
        this.setPageState(
          {
            wd: payload.name,
          },
          () => {
            this.getTeacher();
          }
        );
      }
    }, 500);
  },
  onUnload() {
    this.disconnect()
  },
  bindClearSearchTap() {
    app.$store.setCommonState({
      teacher: {
        wd: "",
        list: [],
      },
    });
  },
  bindSearchInput(e) {
    const value = e.detail.value;
    if (!value) {
      this.bindClearSearchTap();
    }
    this.setPageState({
      wd: value,
    });
  },
  call(e) {
    const phone = (e.target.dataset.phone || "").replace("－", "-");
    if (phone.match(/[^0-9\-]/g)) {
      wx.getClipboardData({
        success: function (res) {
          app.toast({
            icon: "success",
            title: "复制成功",
          });
        },
      });
    } else {
      wx.makePhoneCall({
        phoneNumber: phone,
      });
    }
  },
  getTeacher(callback = this.afterGetTeacher) {
    wx.showLoading({
      title: "获取数据中",
    });
    app.services.getTeacher(callback, {
      data: {
        wd: this.data.wd,
      },
      showError: true,
    });
  },
  bindConfirmSearchTap() {
    this.getTeacher();
  },
  afterGetTeacher() {
    wx.hideLoading();
    setTimeout(() => {
      if (!this.data.teacher || this.data.teacher.list.length === 0) {
        app.toast({
          icon: "error",
          title: "没有相关教师",
        });
      }
    }, 300);
  },
});
