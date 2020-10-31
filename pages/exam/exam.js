import logger from "../../utils/logger";

let app = getApp();

Page({
  data: {
    hideInfo: false,
    showLoading: true,
    currentTerm: "",
  },
  onLoad() {
    let _this = this;
    app.$store.connect(this, "exam");
    this.observeCommon("icons");
    this.observeCommon("exam");
    this.observeCommon("userInfo");
    setTimeout(() => {
      // 判断是否登录
      if (!app.isLogin() || !this.data.userInfo) {
        return wx.redirectTo({
          url: "/pages/login/login",
        });
      }

      const year = this.data.userInfo.uno.slice(0, 4);
      if (year <= 2013) {
        // 判断是否绑定原创
        if (!this.data.userInfo.ext.passwords_bind.yc_password) {
          return wx.redirectTo({
            url: "/pages/bind/ycjw",
          });
        }
      } else {
        // 判断是否绑定正方
        if (!this.data.userInfo.ext.passwords_bind.zf_password) {
          return wx.redirectTo({
            url: "/pages/bind/zf",
          });
        }
      }

      // 判断是否有成绩数据
      if (!this.data.exam) {
        this.getExam(this.afterGetExam);
      } else {
        this.afterGetExam();
      }
    }, 500);
  },
  toggleHideInfo() {
    this.setState({
      hideInfo: !this.data.hideInfo,
    });
  },
  toggleShowExam(e) {
    const index = e.currentTarget.dataset.index;
    const exam = this.data.exam;
    exam.list[index].open = !exam.list[index].open;
    app.$store.setCommonState({
      exam: exam,
    });
  },
  getExam() {
    app.services.getExam(this.afterGetExam, {
      showError: true,
    });
  },
  afterGetExam() {
    this.setState({
      showLoading: false,
    });
    try {
      const examData = this.data.exam;
      const term = examData.term;
      this.setState({
        currentTerm: term,
      });
    } catch (err) {
      logger.error("exam", err);
      app.toast({
        icon: "error",
        title: err.message,
      });
    }
  },
  switchTerm(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const term = this.data.currentTerm;
    const termArr = term.match(/(\d+)\/(\d+)\((\d)\)/);
    let targetTerm;
    if (dataset.direction === "left") {
      if (+termArr[3] === 1) {
        targetTerm =
          parseInt(termArr[1]) - 1 + "/" + (parseInt(termArr[2]) - 1) + "(2)";
      } else {
        targetTerm = parseInt(termArr[1]) + "/" + parseInt(termArr[2]) + "(1)";
      }
    } else if (dataset.direction === "right") {
      if (+termArr[3] === 1) {
        targetTerm = parseInt(termArr[1]) + "/" + parseInt(termArr[2]) + "(2)";
      } else {
        targetTerm =
          parseInt(termArr[1]) + 1 + "/" + (parseInt(termArr[2]) + 1) + "(1)";
      }
    }
    wx.showLoading({
      title: "切换学期中",
    });
    app.services.changeExamTerm(targetTerm, () => {
      app.services.getExam(() => {
        wx.hideLoading();
        _this.afterGetExam();
      });
    });
  },
});
