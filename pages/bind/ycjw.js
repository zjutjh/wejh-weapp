import { API } from "../../utils/api";

const app = getApp();

const form = {
  password: "",
};

Page({
  data: {
    helpStatus: false,
    showLoading: true,
  },
  onLoad() {
    app.$store.connect(this, "binding.ycjw");
    setTimeout(() => {
      this.setPageState({
        showLoading: false,
      });
    }, 1000);
  },
  onUnload() {
    this.disconnect();
  },
  onInput(e) {
    const type = e.target.dataset.type;
    form[type] = e.detail.value;
  },
  showHelp() {
    this.setPageState({
      helpStatus: true,
    });
  },
  hideHelp() {
    this.setPageState({
      helpStatus: false,
    });
  },
  binding() {
    const password = form.password;

    if (!password) {
      return wx.showModal({
        title: "错误",
        content: "请填写密码",
        showCancel: false,
      });
    }

    app.fetch({
      url: API("ycjw/bind"),
      data: {
        password,
      },
      showError: true,
      method: "POST",
      success: (res) => {
        wx.showToast({
          duration: 2000,
          title: "绑定成功",
        });
        app.services.getUserInfo(null, {
          showError: true,
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 5,
          });
          wx.navigateTo({
            url: "/pages/setting/setting",
          });
        }, 2000);
      },
    });
  },
});
