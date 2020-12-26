/**
 * 红点提示组件，后续补全文档
 */
Component({
  properties: {
    // {
    //   type: "count|static|simple",
    //   content: ""
    // }
    displayMode: {
      type: Object,
      value: {
        type: "static",
        content: "",
        observer: function (newVal, oldVal) {
          this.refresh();
        },
      },
    },
    enabled: {
      type: Boolean,
      value: true,
    },
    path: {
      type: String,
      value: "",
      observer: function (newVal, oldVal) {
        this.refresh();
      },
    },
    unclearedBadges: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal) {
        this.refresh();
      },
    },
  },
  data: {
    isVisible: false,
    content: "",
  },
  lifetimes: {
    attached: function () {
      this.refresh();
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    refresh: function () {
      const { displayMode, unclearedBadges, path } = this.data;

      if (!(displayMode && displayMode.type)) {
        return;
      }

      const cnt = unclearedBadges.reduce((total, currentVal) => {
        return total + (currentVal.startsWith(path) ? 1 : 0);
      }, 0);

      if (cnt > 0) {
        if (displayMode.type == "static") {
          this.setData({
            isVisible: true,
            content: displayMode.content || "",
          });
        } else if (displayMode.type == "count") {
          this.setData({
            isVisible: true,
            content: cnt,
          });
        } else {
          this.setData({
            isVisible: true,
            content: "",
          });
        }
      } else {
        this.setData({
          isVisible: false,
        });
      }
    },
  },
});
