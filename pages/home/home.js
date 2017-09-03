let app = getApp()

Page({
  data: {
    weekday: ['日', '一', '二', '三', '四', '五', '六', '日']
  },
  onLoad () {
    let _this = this
    app.$store.connect(this, 'home')
    this.observeCommon('userInfo')
    this.observeCommon('weappInfo')
    this.observeCommon('time')
  },
  userBlockClick () {
    if (!this.data.userInfo) {
      return wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  }
})
