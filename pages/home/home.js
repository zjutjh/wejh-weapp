import API from '../../utils/api'

let app = getApp()

Page({
  data: {
  },
  onLoad: function () {
    let _this = this
    app.$store.connect(this, 'home')
  },
})
