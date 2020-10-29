const app = getApp();

const form = {
  helpStatus: false,
  password: "",
};

Page({
  data: {
    showLoading: true,
  },
  onLoad() {
    let _this = this;
    app.$store.connect(this, "binding.ycjw");
    setTimeout(() => {
      this.setState({
        showLoading: false,
      });
    }, 1000);
  },
  showHelp() {
    this.setState({
      helpStatus: true,
    });
  },
  hideHelp() {
    this.setState({
      helpStatus: false,
    });
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

    app.fetch({
      url: app.API("zf/bind"),
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
        app.getUserInfo();
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
