import { API } from "../../utils/api";

const app = getApp();

const form = {
  username: "",
  password: "",
};

Page({
  data: {
    showLoading: true,
    helpStatus: false,
  },
  onLoad() {
    app.$store.connect(this, "login");

    // 直接显示会有动画bug，所以需要先挂载一段时间再显示
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
  login() {
    const username = form.username;
    const password = form.password;
    const type = "weapp";
    const openId = app.$store.getState("common", "openId");
    if (!username || !password) {
      return wx.showModal({
        title: "错误",
        content: "账号以及密码不能为空",
        showCancel: false,
      });
    }
    if (!openId) {
      return app.login(undefined, () => {
        this.login();
      });
    }

    app.fetch({
      url: API("login"),
      data: {
        username,
        password,
        type,
        openid,
      },
      showError: true,
      method: "POST",
      success: (res) => {
        const data = res.data.data;
        const token = data.token;
        const userInfo = data.user;
        app.$store.setState("session", {
          token,
          userInfo,
        });
        wx.showToast({
          duration: 2000,
          title: "登录成功",
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          });
        }, 2000);
      },
    });
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
});
