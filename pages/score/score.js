import logger from "../../utils/logger";
import toast from "../../utils/toast";
import termPicker from "../../utils/termPicker";

const app = getApp();

Page({
  data: {
    sort: false,
    isDetail: false,
    hideScore: false,
    hideInfo: false,
    currentTerm: "",

    termPickerData: {
      range: [["选择学年"], ["选择学期"]],
      value: [0, 0],
    },
  },
  onLoad() {
    app.$store.connect(this, "score");
    this.observe("session", "score");
    this.observe("session", "scoreDetail");
    this.observe("session", "sortedScoreList");
    this.observe("session", "icons");
    this.observe("session", "userInfo");
    this.observe("session", "isLoggedIn");
    this.observe("session", "time");

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

    // 填充学期选择器数据
    const grade = parseInt(this.data.userInfo.uno.substring(0, 4));
    this.setPageState({
      termPickerData: termPicker.generateTermPickerData(
        grade,
        this.data.time.term
      ),
      currentTerm: this.data.time.term,
    });

    // // 判断是否有数据
    // if (!this.data.score) {
    //   this.getScore(this.afterGetScore);
    // } else {
    //   this.afterGetScore();
    // }
  },
  onUnload() {
    this.disconnect();
  },
  toggleHideScore() {
    this.setPageState({
      hideScore: !this.data.hideScore,
    });
  },
  toggleHideInfo() {
    this.setPageState({
      hideInfo: !this.data.hideInfo,
    });
  },
  toggleShowScoreDetail(e) {
    const index = e.currentTarget.dataset.index;
    const scoreDetail = this.data.scoreDetail;
    scoreDetail.list[index].open = !scoreDetail.list[index].open;
    app.$store.setState("session", {
      scoreDetail: scoreDetail,
    });
  },
  toggleDetail() {
    wx.showLoading({
      title: "切换中",
    });
    const isDetail = this.data.isDetail;
    if (isDetail) {
      this.setPageState({
        isDetail: !isDetail,
      });
      wx.hideLoading();
    } else {
      app.services.getScoreDetail(() => {
        wx.hideLoading();
        this.setPageState({
          isDetail: !isDetail,
        });
      });
    }
  },
  toggleSort() {
    this.setPageState({
      sort: !this.data.sort,
    });
  },
  getScore() {
    app.services.getScore(this.afterGetScore, {
      showError: true,
    });
  },
  afterGetScore() {
    try {
      // const scoreData = this.data.score;
      // const term = scoreData.term;
      // this.setPageState({
      //   currentTerm: term,
      // });
    } catch (err) {
      logger.error("score", err);
      toast({
        icon: "error",
        title: err.message,
      });
    }
  },
  onTermPickerChange: function (e) {
    const { range } = this.data.termPickerData;
    const newTerm = termPicker.generateTermStr(
      range[0][e.detail.value[0]],
      e.detail.value[1] + 1
    );
    this.setData({
      currentTerm: newTerm,
    });

    if (termPicker.validateTerm(newTerm)) {
      wx.showLoading({
        title: "切换学期中",
      });
      app.services.changeScoreTerm(newTerm, () => {
        app.services.getScore(() => {
          wx.hideLoading();
          _this.afterGetScore();
        });
      });
    }
  },
});
