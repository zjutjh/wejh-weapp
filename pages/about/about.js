import API from '../../utils/api'

let app = getApp()
Page({
  data: {
    name: app.name,
    version: app.version
  },
  onLoad: function () {
    let _this = this
    app.$store.connect(this, 'about')
  }
})
