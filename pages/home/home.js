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
  goFeedback () {
    const systemInfo = wx.getSystemInfoSync()
    const userInfo = this.data.userInfo
    wx.getNetworkType({
      success: function(res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        const networkType = res.networkType
        const customData = {
          clientInfo: systemInfo.SDKVersion,
          clientVersion: systemInfo.version,
          os: systemInfo.platform,
          osVersion: systemInfo.system,
          netType: networkType,
          customInfo: JSON.stringify({
            uno: userInfo.uno,
            version: app.version
          })
        }
        console.log('跳转到反馈社区', customData)
        wx.navigateToMiniProgram({
          appId: app.env('tucaoAppId'),
          extraData: {
            id: '19048',
            customData
          }
        })
      }
    })
  },
  userBlockClick () {
    if (!this.data.userInfo) {
      return wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  }
})
