Component({
  properties: {
    title: {
      type: String,
      value: "",
    },
    inputtips: {
      type: String,
      value: "",
    },
    // content: {
    //   type: String,
    //   value: "",
    // },
    // footer: {
    //   type: String,
    //   value: "",
    // },
    // clipboard: {
    //   type: String,
    //   value: "",
    // },
    // clipboardTip: {
    //   type: String,
    //   value: "",
    // },
  },
  data: {
    isVisible: false,
    content: "",
    value: "",
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
    input: function (e) {
      this.setData({
        value: e.detail.value,
      });
    },
    confirm() {
      console.log(this.data.value);
      this.triggerEvent("events"); //让确认按钮能在那边使用函数
      this.hide();
    },
    // clipboard() {
    //   if (this.data.clipboard) {
    //     const { clipboard: text, clipboardTip: tip } = this.data;
    //     wx.setClipboardData({ data: text });
    //   }
    // },
  },
});
