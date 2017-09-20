const app = getApp()

Page({
  data: {
    inputTiming: null,
    showLoading: true,
    password: '',
  },
  onLoad () {
    let _this = this
    app.$store.connect(this, 'binding.ycjw')
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
  binding () {
    const password = this.data.password

    if(!password) {
      return wx.showModal({
        title: '错误',
        content: '请填写密码',
        showCancel: false
      })
    }

    app.fetch({
      url: app.API('zf/bind'),
      data: {
        password,
      },
      showError: true,
      method: 'POST',
      success: (res) => {
        wx.showToast({
          duration: 2000,
          title: '绑定成功'
        })
        app.getUserInfo()
        setTimeout(() => {
          wx.navigateBack({
            delta: 5
          })
          wx.navigateTo({
            url: '/pages/setting/setting'
          })
        },2000)
      }
    })
  }
})
