import termUtil from "../../utils/termPicker";

const app = getApp();

Page({
  data: {
    sort: false,
    hideScore: false,
    hideInfo: false,

    termPickerCurrentData: null,

    detailMap: [
      {
        match: "课程性质名称",
        display: "课程性质",
      },
      {
        match: "课程归属名称",
        display: "课程归属",
      },
      {
        match: "学分",
        display: "课程学分",
      },
    ],

    openedIndices: {},
  },
  onLoad() {
    app.$store.connect(this, "score");

    this.observe("session", "icons");
    this.observe("session", "userInfo");
    this.observe("session", "isLoggedIn");
    this.observe("session", "time");
    this.observe("session", "score", null, (newValue) => {
      if (!(newValue && newValue.score)) {
        return;
      }
      // 请求返回后, 更新学期选择器的选中状态
      const { term } = newValue.score;
      const termInfo = termUtil.getInfoFromTerm(term);
      this.setPageState({
        termPickerCurrentData: {
          termInfo,
        },
        openedIndices: {},
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
      let targetTermInfo = termInfo;
      // 对于成绩查询场景，当前周在 14 周及以前时，选中上一学期
      if (this.data.time.week <= 14) {
        if (targetTermInfo.week === 1) {
          // 对于大一新生, 默认选中的学期不往前调整
          if (grade && targetTermInfo.year - 1 >= grade) {
            targetTermInfo.year -= 1;
            targetTermInfo.semester = 2;
          }
        } else {
          targetTermInfo.semester = 1;
        }
      }
      this.setPageState({
        termPickerCurrentData: {
          termInfo: targetTermInfo,
        },
      });
    }

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

    const { termInfo } = this.data.termPickerCurrentData;

    wx.showLoading({
      title: "获取成绩中",
      mask: true,
    });
    app.services.getScore(termInfo, () => {
      _this.hideLoading();
    });
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
    this.setPageState({
      openedIndices: {
        ...this.data.openedIndices,
        [index]: !this.data.openedIndices[index],
      },
    });
  },
  toggleSort() {
    // 切换排序模式前，清除所有的打开状态
    this.setPageState({
      sort: !this.data.sort,
      openedIndices: {},
    });
  },
  termChange: function (e) {
    const { termInfo } = e.detail;
    wx.showLoading({
      title: "获取成绩中",
      mask: true,
    });
    const _this = this;
    app.services.getScore(termInfo, () => {
      _this.hideLoading();
    });
  },
});
