import WeappStore from './utils/store'
import Fetch from './utils/fetch'
import API from './utils/api'
let store = new WeappStore({})
const fetch = Fetch(store)
App({
  name: '微精弘',
  version: 'v0.0.1',
  onLaunch: function() {
    store.connect(this, 'common')
    //调用API从本地缓存中获取数据
    let logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  API,
  fetch,
  getUserInfo: function(cb) {
    let that = this
    const commonData = store.store.common
    if (commonData.userInfo) {
      typeof cb === "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function(res) {
          that.globalData.userInfo = res.userInfo
          typeof cb === "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  $store: store
})
