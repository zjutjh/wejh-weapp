let app = getApp()

Page({
  data: {
    sort: false,
    sortAnimation: false,
    hideScore: false,
    hideInfo: false,
    showLoading: true,
    currentTerm: ''
  },
  onLoad () {
    let _this = this
    app.$store.connect(this, 'borrow')
    this.observeCommon('borrow')
    this.observeCommon('icons')
    this.observeCommon('userInfo')
    setTimeout(() => {
      // 判断是否登录
      if (!app.isLogin() || !this.data.userInfo) {
        return wx.redirectTo({
          url: '/pages/login/login'
        })
      }

      // 判断是否有成绩数据
      if (!this.data.borrow) {
        this.getBorrow(this.afterGetBorrow, {
          back: true
        })
      } else {
        this.afterGetBorrow()
      }
    }, 500)
  },
  getBorrow (callback = this.afterGetBorrow, option = {}) {
    app.services.getBorrow(callback, {
      showError: true,
      ...option
    })
  },
  afterGetBorrow () {
    this.setState({
      showLoading: false
    })
    try {
    } catch(e) {
      console.error(e)
      app.toast({
        icon: 'error',
        title: e.message
      })
    }
  }
})
