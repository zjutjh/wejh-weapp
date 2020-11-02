let app = getApp();
Page({
  data: {
    name: app.name,
    versionType: app.versionType,
    version: app.version,
  },
  onLoad: function () {
    let _this = this;
    app.$store.connect(this, "about");
  },
});
