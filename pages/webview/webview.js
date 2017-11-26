let app = getApp()
Page({
  data: {
    url: 'https://server.wejh.imcr.me/'
  },
  onLoad: function (option) {
    for (let key in option) {
      option[key] = decodeURIComponent(option[key])
    }
    console.log(option)
    let _this = this
    app.$store.connect(this, 'webview')
    this.setState({
      ...option
    })
  }
})
