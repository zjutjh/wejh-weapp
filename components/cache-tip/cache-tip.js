import formatter from "../../utils/formatter";

import logger from "../../utils/logger";

import dayjs from "../../libs/dayjs/dayjs.min.js";
import dayjs_duration from "../../libs/dayjs/plugin/duration.js";

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
  },
  methods: {
    refresh() {
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
      try {
        const duration = dayjs
          .duration(dayjs().diff(dayjs.unix(this.data.timestamp)))
          .asSeconds();

        wx.reportAnalytics("cache_tip_click", {
          content: this.data.text,
          duration: duration,
          title: this.data.title,
        });
      } catch (err) {
        logger.error("cache-tip", "cache-tip埋点上报异常", err);
      }

      wx.showModal({
        title: `为什么我的${this.data.title}可能有延迟`,
        content: `微精弘会展示出最近一次获得的${this.data.title}。当由于教务系统不稳定等原因无法获取最新的${this.data.title}时，请通过教务系统查询。`,
        showCancel: false,
        confirmText: "我知道了",
      });
    },
  },
});
