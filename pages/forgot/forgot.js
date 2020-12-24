import { API } from "../../utils/api";

const app = getApp();

const form = {
  username: "",
  password: "",
  validatePassword: "",
  iid: "",
};

Page({
  data: {
    showLoading: true,
  },
  onLoad() {
    let _this = this;
    app.$store.connect(this, "forgot");
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
  forgot() {
    const username = form.username;
    const password = form.password;
    const validatePassword = form.validatePassword;
    const iid = form.iid;

    if (!username || !password || !iid) {
      return wx.showModal({
        title: "错误",
        content: "表单项不能为空",
        showCancel: false,
      });
    }

    if (password !== validatePassword) {
      return wx.showModal({
        title: "请重新填写",
        content: "两次输入的密码不一致",
        showCancel: false,
      });
    }

    app.fetch({
      url: API("forgot"),
      data: {
        username,
        password,
        iid,
      },
      showError: true,
      method: "POST",
      success: (res) => {
        wx.showToast({
          duration: 2000,
          title: "重置成功",
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      },
    });
  },
});
