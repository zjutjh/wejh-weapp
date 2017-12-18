import WeappStore from './utils/store'
import Fetch from './utils/fetch'
import API from './utils/api'
import toast from './utils/toast'
import Services from './utils/services'
import envConfig from 'env'

const store = new WeappStore({
  common: {
    userInfo: null,
    weappInfo: null
  }
}, {})
const env = (key) => envConfig[key]
const systemInfo = wx.getSystemInfoSync()
const isDev = systemInfo.platform === 'devtools'
const fetch = Fetch({
  $store: store,
  isDev
})
const services = Services({
  fetch,
  store
})
const staticKey = 'static'
console.log(systemInfo)
App({
  name: '微精弘',
  version: 'v1.0.8',
  versionType: '正式版',
  onLaunch: function() {
    store.connect(this, 'common')
    this.getData()
  },
  set(key, value) {
    const staticData = wx.getStorageSync(staticKey) || {}
    Object.assign(staticData, {
      [key]: value
    })
    wx.setStorageSync(staticKey, staticData)
  },
  get(key) {
    const staticData = wx.getStorageSync(staticKey)
    return staticData[key]
  },
  getData() {
    this.getTermTime()
    this.getWeappInfo()
    this.getAppList()
    this.login(this.getOpenid)
  },
  getTermTime: () => {
    fetch({
      url: API('time'),
      showError: true,
      success: (res) => {
        const result  = res.data
        store.setCommonState({
          time: result.data
        })
      }
    })
  },
  getAppList () {
    services.getAppList()
  },
  getOpenid(code, afterLogin) {
    const _this = this
    const openid = _this.get('openid')
    if(openid) {
      store.setCommonState({
        openid
      })
      _this.autoLogin()
      return
    }
    fetch({
      url: API('code'),
      data: {
        code
      },
      method: 'POST',
      showError: true,
      success: (res) => {
        const result  = res.data
        const openid = result.data.openid
        store.setCommonState({
          openid
        })
        _this.set('openid', openid)
        _this.autoLogin()
        afterLogin()
      }
    })
  },
  getUserInfo() {
    fetch({
      url: API('user'),
      showError: true,
      success: (res) => {
        const result  = res.data
        const userInfo = result.data
        store.setCommonState({
          userInfo
        })
      }
    })
  },
  isLogin() {
    return !!store.getCommonState('userInfo')
  },
  hasOpenid() {
    return !!store.getCommonState('openid')
  },
  hasToken() {
    return !!store.getCommonState('token')
  },
  login(callback = this.getOpenid, afterLogin = function () {}) {
    wx.login({
      success: (res) => {
        if (!res.code) {
          return toast({
            icon: 'error',
            title: '获取用户登录态失败！' + res.errMsg
          })
        }
        callback(res.code, afterLogin)
      }
    })
  },
  autoLogin() {
    this.hasOpenid() && fetch({
      url: API('autoLogin'),
      method: 'POST',
      data: {
        type: 'weapp',
        openid: store.getCommonState('openid')
      },
      success: (res) => {
        const result = res.data
        if (result.errcode > 0) {
          toast({
            title: '自动登录成功'
          })
          store.setCommonState({
            token: result.data.token,
            userInfo: result.data.user
          })
        }
      }
    })
  },
  getWeappInfo: (cb) => {
    let that = this
    const commonData = store.getCommonState()
    if (commonData.userInfo) {
      typeof cb === "function" && cb(commonData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success(res) {
          const userInfo = res.userInfo
          store.setCommonState({
            weappInfo: userInfo
          })
          typeof cb === "function" && cb(userInfo)
        },
        fail() {
          toast({
            icon: 'error',
            title: '获取用户信息失败'
          })
        }
      })
    }
  },
  goFeedback: () => {
    const userInfo = store.getCommonState('userInfo')
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
            version: this.version
          })
        }
        console.log('跳转到反馈社区', customData)
        wx.navigateToMiniProgram({
          appId: env('tucaoAppId'),
          extraData: {
            id: '19048',
            customData
          }
        })
      }
    })
  },
  isPreview: () => wx.getStorageSync(staticKey)['preview'],
  systemInfo,
  isDev: systemInfo.platform === 'devtools',
  env,
  services,
  API,
  fetch,
  toast,
  $store: store
})
