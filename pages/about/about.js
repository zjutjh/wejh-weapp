let app = getApp();
Page({
  data: {
    name: app.name,
    versionType: app.versionType,
    version: app.version,
    currentYear: new Date().getFullYear(),
    headerTapCount: 0,
    // observed keys
    devMenuEnabled: false,
  },
  onLoad() {
    app.$store.connect(this, "about");
    this.observe("static", "devMenuEnabled");
  },
  onUnload() {
    this.disconnect()
  },
  onShow() {
    this.data.headerTapCount = 0;
  },
  headerTap() {
    this.data.headerTapCount += 1;
    if (this.data.headerTapCount === 5) {
      if (!this.data.devMenuEnabled) {
        app.$store.setState("static", {
          devMenuEnabled: true,
        });
        this.data.headerTapCount = 0;
      }
      app.toast({
        icon: "success",
        title: "调试彩蛋已打开",
      });
    }
  },
});
