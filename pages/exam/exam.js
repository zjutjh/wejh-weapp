import logger from "../../utils/logger";
import toast from "../../utils/toast";
import termUtil from "../../utils/termPicker";

const app = getApp();

Page({
  data: {
    hideInfo: false,
    showLoading: false,

    currentTerm: "",

    termPickerData: {
      range: [["选择学年"], ["选择学期"]],
      value: [0, 0],
    },
  },
  onLoad() {
    app.$store.connect(this, "exam");
    this.observe("session", "icons");
    this.observe("session", "exam");
    this.observe("session", "time");
    this.observe("session", "userInfo");
    this.observe("session", "isLoggedIn");

    // 判断是否登录
    if (!this.data.isLoggedIn) {
      return wx.redirectTo({
        url: "/pages/login/login",
      });
    }

    if (!this.data.userInfo.ext.passwords_bind.zf_password) {
      return wx.redirectTo({
        url: "/pages/bind/zf",
      });
    }

    //获得学期数据
    const termInfo = termUtil.getInfoFromTerm(this.data.time.term);
    const grade = parseInt(this.data.userInfo.uno.substring(0, 4));

    let termPickerData = termUtil.getTermPickerData(grade, termInfo);

    this.setPageState({
      termInfo: termInfo,
      currentTerm: termUtil.getPrettyTermStr(termInfo),
      termPickerData: termPickerData,
    });

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
    // if (!this.data.exam) {
    //   this.getExam(this.afterGetExam);
    // } else {
    //   this.afterGetExam();
    // }
  },
  onUnload() {
    this.disconnect();
  },
  hideLoading() {
    setTimeout(() => {
      wx.hideLoading();
    }, 500);
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
  termChange: function (e) {
    const termInfo = e.detail.termInfo;
    wx.showLoading({
      title: "获取考试安排中",
      mask: true,
    });
    console.log("233");
    const _this = this;
    app.services.getExam(termInfo, () => {
      _this.hideLoading();
    });
  },
  // getExam() {
  //   app.services.getExam(this.afterGetExam, {
  //     showError: true,
  //   });
  // },
  // afterGetExam() {
  //   this.setPageState({
  //     showLoading: false,
  //   });
  //   try {
  //     const examData = this.data.exam;
  //     const term = examData.term;
  //     this.setPageState({
  //       currentTerm: term,
  //     });
  //   } catch (err) {
  //     logger.error("exam", err);
  //     toast({
  //       icon: "error",
  //       title: err.message,
  //     });
  //   }
  // },
  // switchTerm(e) {
  //   const _this = this;
  //   const dataset = e.currentTarget.dataset;
  //   const term = this.data.currentTerm;
  //   const termArr = term.match(/(\d+)\/(\d+)\((\d)\)/);
  //   let targetTerm;
  //   if (dataset.direction === "left") {
  //     if (+termArr[3] === 1) {
  //       targetTerm =
  //         parseInt(termArr[1]) - 1 + "/" + (parseInt(termArr[2]) - 1) + "(2)";
  //     } else {
  //       targetTerm = parseInt(termArr[1]) + "/" + parseInt(termArr[2]) + "(1)";
  //     }
  //   } else if (dataset.direction === "right") {
  //     if (+termArr[3] === 1) {
  //       targetTerm = parseInt(termArr[1]) + "/" + parseInt(termArr[2]) + "(2)";
  //     } else {
  //       targetTerm =
  //         parseInt(termArr[1]) + 1 + "/" + (parseInt(termArr[2]) + 1) + "(1)";
  //     }
  //   }
  //   wx.showLoading({
  //     title: "切换学期中",
  //   });
  //   app.services.changeExamTerm(targetTerm, () => {
  //     app.services.getExam(() => {
  //       wx.hideLoading();
  //       _this.afterGetExam();
  //     });
  //   });
  // },
});
