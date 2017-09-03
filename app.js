import WeappStore from './utils/store'
import Fetch from './utils/fetch'
import API from './utils/api'
import toast from './utils/toast'
import Services from './utils/services'

const store = new WeappStore({
  common: {
    userInfo: null,
    weappInfo: null
  }
})
const fetch = Fetch(store)
const services = Services({
  fetch,
  store
})
const staticKey = 'static'
App({
  name: '微精弘',
  version: 'v0.0.1',
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
    this.login(this.getOpenid)
  },
  getTermTime: () => {
    fetch({
      url: API('time'),
      showError: true,
      success: (res) => {
        const result  = res.data
        store.setFieldState('common', {
          time: result.data
        })
      }
    })
  },
  getOpenid(code) {
    const _this = this
    const openid = _this.get('openid')
    if(openid) {
      store.setFieldState('common', {
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
        store.setFieldState('common', {
          openid
        })
        _this.set('openid', openid)
        _this.autoLogin()
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
        store.setFieldState('common', {
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
  login(callback) {
    wx.login({
      success: (res) => {
        if (!res.code) {
          return toast({
            icon: 'error',
            title: '获取用户登录态失败！' + res.errMsg
          })
        }
        callback(res.code)
      }
    })
  },
  autoLogin() {
    this.hasOpenid() && fetch({
      url: API('autoLogin'),
      method: 'POST',
      data: {
        type: 'weapp',
        openid: store.getStore('common')['openid']
      },
      success: (res) => {
        const result = res.data
        if (result.errcode > 0) {
          toast({
            title: '自动登录成功'
          })
          store.setFieldState('common', {
            token: result.data.token,
            userInfo: result.data.user
          })
        }
      }
    })
  },
  getWeappInfo: (cb) => {
    let that = this
    const commonData = store.getStore('common')
    if (commonData.userInfo) {
      typeof cb === "function" && cb(commonData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success(res) {
          const userInfo = res.userInfo
          store.setFieldState('common', {
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
  services,
  API,
  fetch,
  toast,
  $store: store
})
