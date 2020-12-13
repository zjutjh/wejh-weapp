Component({
  properties: {
    displayMode: {
      type: Object,
      value: {
        type: "static",
        content: "",
      },
    },
    identifier: {
      type: String,
      value: "",
    },
    unclearedRedDots: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal) {
        this.refresh();
      },
    },
  },
  data: {
    isVisible: false,
    content: "123123",
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
      const { displayMode, unclearedRedDots, identifier } = this.data;

      if (!displayMode || !displayMode.type) {
        return;
      }

      const cnt = unclearedRedDots.reduce((total, currentVal) => {
        return total + (currentVal.startsWith(identifier) ? 1 : 0);
      }, 0);

      if (cnt > 0) {
        if (displayMode.type == "static") {
          this.setData({
            content: displayMode.content || "",
          });
        } else if (displayMode.type == "count") {
          this.setData({
            isVisible: true,
            content: cnt,
          });
        }
      } else {
        this.setData({
          isVisible: false,
        });
      }
      // /home/setting/
    },
  },
});

// {
//   type: "count|static|simple",
//   content: ""
// }
