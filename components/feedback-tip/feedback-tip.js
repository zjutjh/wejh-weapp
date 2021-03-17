import logger from "../../utils/logger";

Component({
  properties: {},
  data: {
    _timeoutId: null,
    isShown: false,
  },
  lifetimes: {
    attached() {
      wx.onUserCaptureScreen(() => {
        this.showTip();
      });
    },
    detached() {
      this.hideTip();
    },
  },
  pageLifetimes: {
    hide() {
      this.hideTip();
    },
  },
  methods: {
    showTip() {
      this.reportAnalytics("show");

      this.hideTip();
      this.setData({
        isShown: true,
      });
      setTimeout(() => {
        this.setData({
          isShown: false,
        });
      }, 10000);
    },
    hideTip() {
      this.setData({
        isShown: false,
      });
      clearTimeout(this.data._timeoutId);
    },
    onFeedback() {
      this.reportAnalytics("click");
      this.hideTip();
      wx.navigateTo({
        url: "/pages/feedback/feedback",
      });
    },
    reportAnalytics(event) {
      try {
        const pages = getCurrentPages();
        const currentUrl = pages[pages.length - 1]["__route__"];
        wx.reportAnalytics("screenshot_feedback", {
          src_page: `${event}: ${currentUrl}`,
        });
      } catch (err) {
        logger.error("feedback", "截图反馈点击埋点上报异常", err);
      }
    },
  },
});
