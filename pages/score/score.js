import logger from "../../utils/logger";
let app = getApp();

Page({
  data: {
    sort: false,
    isDetail: false,
    sortAnimation: false,
    detailAnimation: false,
    hideScore: false,
    hideInfo: false,
    showLoading: true,
    currentTerm: "",
  },
  onLoad() {
    app.$store.connect(this, "score");
    this.observe("session", "score");
    this.observe("session", "scoreDetail");
    this.observe("session", "sortedScoreList");
    this.observe("session", "icons");
    this.observe("session", "userInfo");
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
      if (!this.data.score) {
        this.getScore(this.afterGetScore);
      } else {
        this.afterGetScore();
      }
    }, 500);
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
        detailAnimation: true,
        isDetail: !isDetail,
      });
      wx.hideLoading();
    } else {
      this.setPageState({
        detailAnimation: true,
      });
      app.services.getScoreDetail(() => {
        wx.hideLoading();
        this.setPageState({
          isDetail: !isDetail,
        });
      });
    }

    setTimeout(() => {
      this.setPageState({
        detailAnimation: false,
      });
    }, 500);
  },
  toggleSort() {
    this.setPageState({
      sortAnimation: true,
      sort: !this.data.sort,
    });

    setTimeout(() => {
      this.setPageState({
        sortAnimation: false,
      });
    }, 500);
  },
  getScore() {
    app.services.getScore(this.afterGetScore, {
      showError: true,
    });
  },
  afterGetScore() {
    this.setPageState({
      showLoading: false,
    });
    try {
      const scoreData = this.data.score;
      const term = scoreData.term;
      this.setPageState({
        currentTerm: term,
      });
    } catch (err) {
      logger.error("score", err);
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
    app.services.changeScoreTerm(targetTerm, () => {
      app.services.getScore(() => {
        wx.hideLoading();
        _this.afterGetScore();
      });
    });
  },
});
