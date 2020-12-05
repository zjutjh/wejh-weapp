import logger from "../../utils/logger";
let app = getApp();

Page({
  data: {
    url: "",
  },
  onLoad: function (option) {
    for (let key in option) {
      option[key] = decodeURIComponent(option[key]);
    }
    logger.info("webview", option);
    app.$store.connect(this, "webview");
    this.setPageState({
      ...option,
    });
  },
  onUnload() {
    this.disconnect()
  },
});
