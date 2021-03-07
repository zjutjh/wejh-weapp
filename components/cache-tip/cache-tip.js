import dayjs from "../../libs/dayjs/dayjs.min.js";
import dayjs_duration from "../../libs/dayjs/plugin/duration.js";
import formatter from "../../utils/formatter";
import logger from "../../utils/logger";

dayjs.extend(dayjs_duration);

Component({
  properties: {
    title: {
      type: String,
      value: "信息",
      observer: function (newVal, oldVal) {
        this.refresh();
      },
    },
    timestamp: {
      type: Number,
      value: null,
      observer: function (newVal, oldVal) {
        this.refresh();
      },
    },
  },
  data: {
    text: "",
    _intervalId: null,
  },
  lifetimes: {
    attached() {
      clearInterval(this.data._intervalId);
      this.data._intervalId = setInterval(() => {
        this.refresh();
      }, 60 * 1000);
    },
    detached() {
      clearInterval(this.data._intervalId);
    },
  },
  methods: {
    refresh() {
      logger.info("cache-tip", "cache-tip refresh");
      const { timestamp } = this.data;
      if (timestamp) {
        this.setData({
          text: formatter.formatLastUpdate(timestamp),
        });
      } else {
        this.setData({
          text: `暂无${this.data.title}`,
        });
      }
    },
    showHint() {
      var duration = 0;

      if (this.data.timestamp) {
        duration = dayjs
          .duration(dayjs().diff(dayjs.unix(this.data.timestamp)))
          .asSeconds();
      }

      wx.reportAnalytics("cache_tip_click", {
        content: this.data.text,
        duration: duration,
        title: this.data.title,
      });

      // 数据更新时间距今大于一分钟显示红点
      if (duration > 60) {
        wx.showModal({
          title: `为什么我的${this.data.title}可能有延迟`,
          content: `微精弘会展示出最近一次获得的${this.data.title}。当由于教务系统不稳定等原因无法获取最新的${this.data.title}时，请通过教务系统查询。`,
          showCancel: false,
          confirmText: "我知道了",
        });
      }
    },
  },
});
