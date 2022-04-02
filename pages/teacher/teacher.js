import toast from "../../utils/toast";

const app = getApp();

Page({
  data: {
    wd: "",
  },
  onLoad(payload) {
    app.$store.connect(this, "teacher");
    this.observe("session", "teacher");
    this.observe("session", "icons");
    this.observe("session", "userInfo");
    this.observe("session", "isLoggedIn");

    // 判断是否登录
    if (!this.data.isLoggedIn) {
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
  },
  onUnload() {
    this.disconnect();
  },
  bindClearSearchTap() {
    this.setPageState({
      wd: "",
      teacher: {
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
          toast({
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
    // this.getTeacher();
    wx.showModal({
      title: "提示",
      content: "教师搜索升级改造中，敬请期待~",
      showCancel: false,
      confirmText: "确定",
    });
  },
  afterGetTeacher() {
    wx.hideLoading();
    setTimeout(() => {
      if (!this.data.teacher || this.data.teacher.list.length === 0) {
        toast({
          icon: "error",
          title: "没有相关教师",
        });
      }
    }, 300);
  },
});
