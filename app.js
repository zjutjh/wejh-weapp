import WeappStore from './utils/store'
import Fetch from './utils/fetch'
import API from './utils/api'
import toast from './utils/toast'

const store = new WeappStore({
  common: {
    userInfo: null,
    weappInfo: null
  }
})
const fetch = Fetch(store)

App({
  name: '微精弘',
  version: 'v0.0.1',
  onLaunch: function() {
    store.connect(this, 'common')
    this.getTermTime()
    this.getWeappInfo()
    this.login()
  },
  set(key, value) {
    wx.setStorageSync(key, value)
  },
  get(key) {
    return wx.getStorageSync(key) || {}
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
  login() {
    const _this = this
    wx.login({
      success: (res) => {
        if (!res.code) {
          return toast({
            icon: 'error',
            title: '获取用户登录态失败！' + res.errMsg
          })
        }
        fetch({
          url: API('code'),
          data: {
            code: res.code
          },
          method: 'POST',
          showError: true,
          success: (res) => {
            const result  = res.data
            const openid = result.data.openid
            store.setFieldState('common', {
              openid
            })
            _this.autoLogin()
          }
        })
      }
    })
  },
  autoLogin() {
    fetch({
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
  API,
  fetch,
  toast,
  $store: store
})
