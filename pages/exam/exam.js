import logger from "../../utils/logger";
import toast from "../../utils/toast";

const app = getApp();

Page({
  data: {
    hideInfo: false,
    showLoading: true,
    currentTerm: "",
  },
  onLoad() {
    app.$store.connect(this, "exam");
    this.observe("session", "icons");
    this.observe("session", "exam");
    this.observe("session", "userInfo");
    setTimeout(() => {
      // 判断是否登录
      if (!app.isLogin() || !this.data.userInfo) {
        return wx.redirectTo({
          url: "/pages/login/login",
        });
      }

      if (!this.data.userInfo.ext.passwords_bind.zf_password) {
        return wx.redirectTo({
          url: "/pages/bind/zf",
        });
      }

      // 判断是否有成绩数据
      if (!this.data.exam) {
        this.getExam(this.afterGetExam);
      } else {
        this.afterGetExam();
      }
    }, 500);
  },
  onUnload() {
    this.disconnect();
  },
  toggleHideInfo() {
    this.setPageState({
      hideInfo: !this.data.hideInfo,
    });
  },
  toggleShowExam(e) {
    const index = e.currentTarget.dataset.index;
    const exam = this.data.exam;
    exam.list[index].open = !exam.list[index].open;
    app.$store.setState("session", {
      exam: exam,
    });
  },
  getExam() {
    app.services.getExam(this.afterGetExam, {
      showError: true,
    });
  },
  afterGetExam() {
    this.setPageState({
      showLoading: false,
    });
    try {
      const examData = this.data.exam;
      const term = examData.term;
      this.setPageState({
        currentTerm: term,
      });
    } catch (err) {
      logger.error("exam", err);
      toast({
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
