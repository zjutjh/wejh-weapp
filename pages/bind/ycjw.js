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
      <p class="question">1、原创教务系统是什么？</p>
      <p class="answer">原创教务系统是以前的教务系统，为了老生的使用，所以依旧放着</p>
      <p class="answer">17级及以后的学生大可忽略，不用绑定</p>
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
  onInput(e) {
    const type = e.target.dataset.type;
    form[type] = e.detail.value;
  },
  showHelp() {
    this.helpModal.show();
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
