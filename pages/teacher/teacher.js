let app = getApp()

Page({
  data: {
    wd: ''
  },
  onLoad () {
    let _this = this
    app.$store.connect(this, 'teacher')
    this.observeCommon('teacher')
    this.observeCommon('icons')
    this.observeCommon('userInfo')
    setTimeout(() => {
      // 判断是否登录
      if (!app.isLogin() || !this.data.userInfo) {
        return wx.redirectTo({
          url: '/pages/login/login'
        })
      }
    }, 500)
  },
  bindClearSearchTap () {
    app.$store.setCommonState({
      teacher: {
        wd: '',
        list: []
      }
    })
  },
  bindSearchInput(e) {
    const value = e.detail.value
    if (!value) {
      this.bindClearSearchTap()
    }
    this.setState({
      wd: value
    })
  },
  getTeacher (callback = this.afterGetTeacher) {
    wx.showLoading({
      title: '获取数据中'
    })
    app.services.getTeacher(callback, {
      data: {
        wd: this.data.wd
      },
      showError: true
    })
  },
  bindConfirmSearchTap () {
    this.getTeacher()
  },
  afterGetTeacher () {
    wx.hideLoading()
    setTimeout(() => {
      if (!this.data.teacher || this.data.teacher.list.length === 0) {
        app.toast({
          icon: 'error',
          title: '没有相关教师'
        })
      }
    }, 300)
  },
})
