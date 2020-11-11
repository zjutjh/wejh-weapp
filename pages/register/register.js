import { API } from "../../utils/api";

const app = getApp();

const form = {
  username: "",
  password: "",
  validatePassword: "",
  iid: "",
  email: "",
};

Page({
  data: {
    showLoading: true,
  },
  onLoad() {
    let _this = this;
    app.$store.connect(this, "register");
    setTimeout(() => {
      this.setState({
        showLoading: false,
      });
    }, 1000);
  },
  onInput(e) {
    const type = e.target.dataset.type;
    form[type] = e.detail.value;
  },
  register() {
    const username = form.username;
    const password = form.password;
    const validatePassword = form.validatePassword;
    const iid = form.iid;
    const email = form.email;

    if (!username || !password || !iid || !email) {
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
      url: API("register"),
      data: {
        username,
        password,
        iid,
        email,
      },
      showError: true,
      method: "POST",
      success: (res) => {
        wx.showToast({
          duration: 2000,
          title: "激活成功",
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      },
    });
  },
});
