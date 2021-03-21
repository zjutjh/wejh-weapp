import { API } from "../../utils/api";

const app = getApp();

const form = {
  password: "",
};

Page({
  data: {
    helpModal: {
      title: "帮助",
      content: `
      <p class="question">1、正方教务系统是什么？</p>
      <p class="answer">正方教务系统就是你选课的系统哦~</p>
      <p class="answer">那么密码就是你选课的密码~</p>
      <p class="question">2、忘记密码？</p>
      <p class="answer">请找自己的辅导员重置密码。</p>`,
    },
  },
  onLoad() {
    app.$store.connect(this, "binding.ycjw");
    this.helpModal = this.selectComponent("#helpModal");
  },
  onUnload() {
    this.disconnect();
  },
  showHelp() {
    this.helpModal.show();
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

    app.services.bindZf(
      () => {
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
      {
        data: {
          password,
        },
      }
    );
  },
});
