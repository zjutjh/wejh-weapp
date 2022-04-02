import { API } from "../../utils/api";

const app = getApp();

const form = {
  password: "",
};

Page({
  data: {},
  onLoad() {
    app.$store.connect(this, "binding.library");
  },
  onUnload() {
    this.disconnect();
  },
  onInput(e) {
    const type = e.target.dataset.type;
    form[type] = e.detail.value;
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

    app.services.bindLibrary(
      () => {
        wx.showToast({
          duration: 2000,
          title: "绑定成功",
        });
        app.services.getUserInfo(null, {
          showError: true,
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      },
      {
        data: {
          password,
        },
      }
    );
  },
});
