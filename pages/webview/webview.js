let app = getApp()
Page({
  data: {
    url: 'https://server.wejh.imcr.me/'
  },
  onLoad: function (option) {
    console.log(option)
    let _this = this
    app.$store.connect(this, 'webview')
    this.setState({
      ...option
    })
  }
})
