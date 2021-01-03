Component({
  properties: {
    title: {
      type: String,
      value: "",
    },
    content: {
      type: String,
      value: "",
    },
    footer: {
      type: String,
      value: "",
    },
    clipboard: {
      type: String,
      value: "",
    },
    clipboardTip: {
      type: String,
      value: "",
    },
  },
  data: {
    isVisible: false,
    content: "",
  },
  methods: {
    show() {
      this.setData({
        isVisible: true,
      });
    },
    hide() {
      this.setData({
        isVisible: false,
      });
    },
    clipboard() {
      if (this.data.clipboard) {
        const { clipboard: text, clipboardTip: tip } = this.data;
        wx.setClipboardData({ data: text });
      }
    },
  },
});
