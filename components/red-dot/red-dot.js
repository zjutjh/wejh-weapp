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
      },
      observer: function (newVal, oldVal) {
        this.refresh();
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
    refresh() {
      const { alwaysVisible, displayMode, unclearedBadges, path } = this.data;

      if (!(displayMode && displayMode.type)) {
        return;
      }

      const cnt =
        path !== ""
          ? unclearedBadges.reduce((total, currentVal) => {
              return total + (currentVal.startsWith(path) ? 1 : 0);
            }, 0)
          : 1;

      let content = "";

      if (cnt > 0) {
        if (displayMode.type == "static") {
          content = displayMode.content || "";
        } else if (displayMode.type == "count") {
          content = cnt;
        }
      }

      this.setData({
        isVisible: cnt > 0,
        content: content,
      });
    },
  },
});
