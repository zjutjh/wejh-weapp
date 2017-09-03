const app = getApp()

Page({
  data: {
    inputTiming: null,
    showLoading: true,
    helpStatus: false,
    username: '',
    password: '',
  },
  onLoad () {
    let _this = this
    app.$store.connect(this, 'login')

    // 直接显示会有动画bug，所以需要先挂载一段时间再显示
    setTimeout(() => {
      this.setState({
        showLoading: false
      })
    }, 1000)
  },
  onInput (e) {
    // 防抖动，小程序的性能有点差，字符输入过快会吞字符
    clearTimeout(this.data.inputTiming)
    const type = e.target.dataset.type
    const timing = setTimeout(() => {
      this.setState({
        [type]: e.detail.value
      })
    }, 500)
    this.setState({
      inputTiming: timing
    })
  },
  login () {
    const username = this.data.username
    const password = this.data.password
    const type = 'weapp'
    const openid = app.$store.getCommonState('openid')
    if(!username || !password) {
      return wx.showModal({
        title: '错误',
        content: '账号以及密码不能为空',
        showCancel: false
      })
    }

    app.fetch({
      url: app.API('login'),
      data: {
        username,
        password,
        type,
        openid
      },
      showError: true,
      method: 'POST',
      success: (res) => {
        const data = res.data.data
        const token = data.token
        const userInfo = data.user
        app.$store.setCommonState({
          token,
          userInfo
        })
        wx.showToast({
          duration: 2000,
          title: '登录成功'
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        },2000)
      }
    })
  },
  showHelp() {
    this.setState({
      helpStatus: true
    })
  },
  hideHelp() {
    this.setState({
      helpStatus: false
    })
  }
})
