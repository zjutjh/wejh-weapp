import termUtil from "../../utils/termPicker";

const app = getApp();

Page({
  data: {
    hideInfo: false,

    // lastUpdated: "考试安排",

    termPickerCurrentData: null,

    termPickerPlaceHolder: {
      range: [["选择学年"], ["选择学期"]],
      value: [0, 0],
    },
  },
  onLoad() {
    app.$store.connect(this, "exam");
    this.observe("session", "icons");
    this.observe("session", "userInfo");
    this.observe("session", "isLoggedIn");
    this.observe("session", "time");
    this.observe("session", "exam", null, (newValue) => {
      if (!(newValue && newValue.exam)) {
        return;
      }
      // 请求返回后, 更新学期选择器的选中状态和上次更新时间
      const { lastUpdated, term } = newValue.exam;
      const termInfo = termUtil.getInfoFromTerm(term);
      this.setPageState({
        termPickerCurrentData: {
          termInfo,
        },
        lastUpdated,
      });
    });

    // 判断是否登录
    if (!this.data.isLoggedIn) {
      return wx.redirectTo({
        url: "/pages/login/login",
      });
    }

    // 判断是否绑定正方
    if (!this.data.userInfo.ext.passwords_bind.zf_password) {
      return wx.redirectTo({
        url: "/pages/bind/zf",
      });
    }

    // 获得学期数据
    const termInfo = termUtil.getInfoFromTerm(this.data.time.term);
    const grade = parseInt(this.data.userInfo.uno.substring(0, 4));

    // 填充学期选择器数据
    this.setPageState({
      termPickerInfo: {
        termInfo,
        grade,
      },
    });

    // 若上次选择的学期不存在，进行生成
    if (!this.data.termPickerCurrentData) {
      this.setPageState({
        termPickerCurrentData: {
          termInfo: termInfo,
        },
      });
    }

    // 判断是否有数据
    if (!this.data.exam) {
      wx.showLoading({
        title: "获取考试安排中",
        mask: true,
      });

      const _this = this;
      app.services.getExam(
        termInfo,
        () => {
          _this.hideLoading();
        },
        {
          showError: true,
        }
      );
    }
  },
  onUnload() {
    this.disconnect();
  },
  hideLoading() {
    // wx.hideLoading 会把错误 toast 一并关掉，导致错误提示消失太快看不到，因此暂时在这里需要加一个延迟
    // 后续会对此处进行优化，loading 状态和错误提示都不使用 toast，避免 block 住用户的行为
    setTimeout(() => {
      wx.hideLoading();
    }, 500);
  },
  toggleRefresh() {
    const _this = this;

    const { termInfo } = this.data.termPickerCurrentData;
    wx.showLoading({
      title: "获取考试安排中",
      mask: true,
    });
    app.services.getExam(termInfo, () => {
      _this.hideLoading();
    });
  },
  toggleHideInfo() {
    this.setPageState({
      hideInfo: !this.data.hideInfo,
    });
  },
  toggleShowExam(e) {
    const index = e.currentTarget.dataset.index;
    const exam = this.data.exam;
    if (exam) {
      exam.list[index].open = !exam.list[index].open;
      this.setPageState({
        exam,
      });
    }
  },
  termChange: function (e) {
    const { termInfo } = e.detail;
    wx.showLoading({
      title: "获取考试安排中",
      mask: true,
    });
    const _this = this;
    app.services.getExam(termInfo, () => {
      _this.hideLoading();
    });
  },
});
