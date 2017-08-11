const initAppList = []
const initApp = {
  title: '加载中',
  disabled: true,
  icon: '/images/app-list/red.png'
}
for (let i = 0; i < 10; i++) {
  initAppList.push(initApp)
}

const app = getApp()
Page({
  data: {
    apps: initAppList
  },
  onLoad: function () {
    let _this = this
    app.$store.connect(this, 'index')

    wx.request({
      url: app.API('app-list'),
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        let data = res.data.data
        _this.setState({
          apps: _this.fixAppList(data['app-list'])
        })
      }
    })
  },
  fixAppList (list) {
    return list.map((item) => {
      item.bg = '../../images/app-list/' + item.bg +'.png'
      return item
    })
  }
})
