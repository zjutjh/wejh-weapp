Component({
  properties: {},
  data: {
    isVisible: false,
    content: "",
    timeoutId: null,
  },
  methods: {
    show(content = "", duration = 1500) {
      if (this.data.timeoutId) {
        clearTimeout(this.data.timeoutId);
        this.data.timeoutId = null;
      }
      this.setData({
        isVisible: true,
        content: content,
      });
      this.data.timeoutId = setTimeout(() => {
        this.hide();
      }, duration);
    },
    hide() {
      this.setData({
        isVisible: false,
      });
    },
  },
});
