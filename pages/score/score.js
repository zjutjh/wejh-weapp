import termUtil from "../../utils/termPicker";
import formatter from "../../utils/formatter";

const app = getApp();

Page({
  data: {
    sort: false,
    hideScore: false,
    hideInfo: false,

    currentTerm: "",
    lastUpdated: "暂无成绩",

    termPickerData: {
      range: [["选择学年"], ["选择学期"], ["类别"]],
      value: [0, 0, 0],
    },
  },
  onLoad() {
    app.$store.connect(this, "score");

    this.observe("session", "icons");
    this.observe("session", "userInfo");
    this.observe("session", "isLoggedIn");
    this.observe("session", "time");
    this.observe("session", "score", "score", (newValue) => {
      if (!(newValue && newValue.score)) {
        return;
      }
      // 请求返回后, 更新学期和上次更新时间
      const { lastUpdated, term } = newValue.score;
      const termInfo = termUtil.getInfoFromTerm(term);
      this.setPageState({
        termInfo: termInfo,
        currentTerm: termUtil.getPrettyTermStr(termInfo),
        lastUpdated: formatter.formatLastUpdate(lastUpdated),
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

    const termInfo = termUtil.getInfoFromTerm(this.data.time.term);
    const grade = parseInt(this.data.userInfo.uno.substring(0, 4));

    let termPickerData = termUtil.getTermPickerData(grade, termInfo);
    termPickerData = {
      range: [...termPickerData.range, ["总评", "分项"]],
      value: [...termPickerData.value, 0],
    };

    // 填充学期选择器数据
    this.setPageState({
      termInfo: termInfo,
      currentTerm: termUtil.getPrettyTermStr(termInfo),
      termPickerData: termPickerData,
    });

    // 判断是否有数据
    if (!this.data.score) {
      wx.showLoading({
        title: "获取成绩中",
        mask: true,
      });

      const _this = this;
      app.services.getScore(
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

    const isDetail = this.data.score && this.data.score.isDetail;
    if (isDetail) {
      wx.showLoading({
        title: "获取成绩中",
        mask: true,
      });
      app.services.getScoreDetail(this.data.termInfo, () => {
        _this.hideLoading();
      });
    } else {
      wx.showLoading({
        title: "获取成绩中",
        mask: true,
      });
      app.services.getScore(this.data.termInfo, () => {
        _this.hideLoading();
      });
    }
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
    const scoreDetail = this.data.score;
    if (scoreDetail && scoreDetail.isDetail) {
      scoreDetail.list[index].open = !scoreDetail.list[index].open;
      this.setPageState({
        score: scoreDetail,
      });
    }
  },
  // toggleDetail() {
  //   const _this = this;
  //   const isDetail = !this.data.isDetail;
  //
  //   const { termInfoDetail, termInfoNormal } = this.data;
  //   const isTermSame =
  //     termInfoDetail.year === termInfoNormal.year &&
  //     termInfoDetail.semester === termInfoNormal.semester;
  //
  //   // 始终使用当前模式的学期去替换另一个模式的学期
  //   const targetTerm = isDetail ? termInfoNormal : termInfoDetail;
  //
  //   this.setPageState({
  //     isDetail: isDetail,
  //     termInfoNormal: targetTerm,
  //     currentTerm: termUtil.getPrettyTermStr(targetTerm),
  //     termInfoDetail: targetTerm,
  //     // currentTermDetail: termUtil.getPrettyTermStr(targetTerm),
  //   });
  //
  //   // 如果目标模式的数据不存在或者不是同一个学期，需要拉取
  //   if (isDetail) {
  //     if (!this.data.scoreDetail || !isTermSame) {
  //       this.setPageState({
  //         scoreDetail: null,
  //       });
  //       wx.showLoading({
  //         title: "切换中",
  //         mask: true,
  //       });
  //       app.services.getScoreDetail(targetTerm, () => {
  //         _this.hideLoading();
  //       });
  //     }
  //   } else {
  //     if (!this.data.score || !isTermSame) {
  //       this.setPageState({
  //         score: null,
  //       });
  //       wx.showLoading({
  //         title: "切换中",
  //         mask: true,
  //       });
  //       app.services.getScore(targetTerm, () => {
  //         _this.hideLoading();
  //       });
  //     }
  //   }
  // },
  toggleSort() {
    this.setPageState({
      sort: !this.data.sort,
    });
  },
  onTermPickerChange: function (e) {
    const { range } = this.data.termPickerData;
    const termInfo = {
      year: range[0][e.detail.value[0]].substring(0, 4),
      semester: e.detail.value[1] + 1,
    };

    const isDetail = e.detail.value[2] === 1;

    wx.showLoading({
      title: "获取成绩中",
      mask: true,
    });
    const _this = this;
    if (isDetail) {
      app.services.getScoreDetail(termInfo, () => {
        _this.hideLoading();
      });
    } else {
      app.services.getScore(termInfo, () => {
        _this.hideLoading();
      });
    }
  },
});
