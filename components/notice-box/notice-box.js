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
        const text = this.data.clipboard;
        const tip = this.data.clipboardTip;
        wx.setClipboardData({
          data: text,
          success() {
            if (tip) {
              toast({
                icon: "success",
                title: tip,
              });
            }
          },
        });
      }
    },
  },
});
