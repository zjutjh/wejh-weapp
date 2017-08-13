const app = getApp()

Page({
  data: {
    inputTiming: null,
    showLoading: true,
    username: '',
    password: '',
    validatePassword: '',
    iid: '',
  },
  onLoad () {
    let _this = this
    app.$store.connect(this, 'forgot')
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
  forgot () {
    const username = this.data.username
    const password = this.data.password
    const validatePassword = this.data.validatePassword
    const iid = this.data.iid
    const email = this.data.email

    if(!username || !password || !iid) {
      return wx.showModal({
        title: '错误',
        content: '表单项不能为空',
        showCancel: false
      })
    }

    if(password !== validatePassword) {
      return wx.showModal({
        title: '请重新填写',
        content: '两次输入的密码不一致',
        showCancel: false
      })
    }

    app.fetch({
      url: app.API('forgot'),
      data: {
        username,
        password,
        iid
      },
      showError: true,
      method: 'POST',
      success: (res) => {
        wx.showToast({
          duration: 2000,
          title: '重置成功'
        })
        setTimeout(() => {
          wx.navigateBack()
        },2000)
      }
    })
  }
})
