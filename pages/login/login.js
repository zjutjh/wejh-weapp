import API from '../../utils/api'

let app = getApp()

Page({
  data: {
    angle: 0
  },
  onLoad: function () {
    let _this = this
    app.$store.connect(this, 'login')
  }
})
