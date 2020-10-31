let app = getApp();

Page({
  data: {
    name: app.name,
    versionType: app.versionType,
    version: app.version,
    currentYear: new Date().getFullYear(),
  },
  pageData: {
    headerTapCount: 0,
  },
  onLoad() {
    let _this = this;
    app.$store.connect(this, "about");
  },
  onShow() {
    this.pageData.headerTapCount = 0;
  },
  headerTap() {
    this.pageData.headerTapCount += 1;
    if (this.pageData.headerTapCount === 5) {
      const devMenuEnabled = app.get("devMenuEnabled");
      if (!devMenuEnabled) {
        app.set("devMenuEnabled", true);
        this.pageData.headerTapCount = 0;
      }
      app.toast({
        icon: "success",
        title: "调试彩蛋已打开",
      });
    }
  },
});
