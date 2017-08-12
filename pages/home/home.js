let app = getApp()

Page({
  data: {
    weekday: ['日', '一', '二', '三', '四', '五', '六']
  },
  onLoad: function () {
    let _this = this
    app.$store.connect(this, 'home')
    this.observe('common', 'userInfo')
    this.observe('common', 'weappInfo')
    this.observe('common', 'time')
  }
})
