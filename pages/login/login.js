import { API } from "../../utils/api";

const app = getApp();

const form = {
  username: "",
  password: "",
};

Page({
  data: {
    helpModal: {
      title: "帮助",
      content: `
      <p class="question">1、帐号和密码是什么？</p>
      <p class="answer">账号是学号，密码是你自己设置的，没有默认密码哦~</p>
      <p class="answer">请先确定是否激活过精弘通行证</p>
      <p class="answer">如未激活，请点击“激活账号”按钮进行激活通行证操作</p>
      <p class="answer">否则请进行忘记密码操作</p>
      <p class="question">2、忘记密码？</p>
      <p class="answer">请点击下方 “忘记密码?” 按钮，并使用身份证进行重置密码</p>`,
    },
  },
  onLoad() {
    app.$store.connect(this, "login");
    this.helpModal = this.selectComponent("#helpModal");
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
      return app.wxLogin(undefined, () => {
        this.login();
      });
    }

    app.services.bindJh(
      (res) => {
        const { token, userInfo } = res.data.data;
        app.$store.setState("session", {
          token,
          userInfo,
        });
        wx.showToast({
          duration: 2000,
          title: "登录成功",
        });
        app.services.getUserInfo(null, {
          showError: true,
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          });
        }, 2000);
      },
      {
        data: {
          username,
          password,
          type,
          openid: openId,
        },
      }
    );
  },
  showHelp() {
    this.helpModal.show();
  },
});
