const app = getApp()

Page({
  data: {
    helpStatus: false,
    username: '',
    password: '',
    validatePassword: '',
    iid: '',
    email: '',
  },
  onInput (e) {
    const type = e.target.dataset.type
    this.setState({
      [type]: e.detail.value
    })
  },
  register () {
    const username = this.data.username
    const password = this.data.password
    const validatePassword = this.data.validatePassword
    const iid = this.data.iid
    const email = this.data.email

    if(!username || !password || !iid || !email) {
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
      url: app.API('register'),
      data: {
        username,
        password,
        iid,
        email
      },
      showError: true,
      method: 'POST',
      success: (res) => {
        wx.showToast({
          duration: 2000,
          title: '激活成功'
        })
        setTimeout(() => {
          wx.navigateBack()
        },2000)
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
