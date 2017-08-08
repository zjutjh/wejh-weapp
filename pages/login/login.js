const app = getApp()

Page({
  data: {
    helpStatus: false,
    username: '',
    password: '',
  },
  onInput (e) {
    const type = e.target.dataset.type
    this.setState({
      [type]: e.detail.value
    })
  },
  login () {
    const username = this.data.username
    const password = this.data.password
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
        password
      },
      showError: true,
      method: 'POST',
      success: (res) => {
        console.log(res)
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },
  onLoad () {
    let _this = this
    app.$store.connect(this, 'login')
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
