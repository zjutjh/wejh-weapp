import util from '../../utils/util'

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
    tinyTip: {
      active: false,
      content: '请先登录'
    },
    helpStatus: false,
    // indexCards: defaultCard,
    apps: initAppList
  },
  onLoad: function (options) {
    app.$store.connect(this, 'index')
    this.observeCommon('userInfo')
    this.observeCommon('apps')
    this.observeCommon('icons')
    this.observeCommon('time', null, this.onTimeUpdate)
    this.observeCommon('timetableFixed')
    this.observeCommon('card')
    this.observeCommon('cardCost')
    this.observeCommon('borrow')
    this.observeCommon('announcement')
    this.observeCommon('cacheStatus')
    this.getData()
    app.set('preview', options.preview)

    this.setState({
      todayTime: new Date().toLocaleDateString()
    })
  },
  hideHelp () {
    this.setState({
      helpStatus: false
    })
  },
  onTimeUpdate () {
    const timetableFixed = this.data.timetableFixed
    if (!timetableFixed) {
      return setTimeout(() => {
        this.onTimeUpdate()
      }, 500)
    }
    const weekday = this.data.time.day
    const week = this.data.time.week
    const todayTimetable = timetableFixed[weekday - 1]
    const timetableToday = []
    todayTimetable.forEach((lessons) => {
      lessons.forEach((lesson) => {
        const isAvailable = lesson['周'][week]
        if (isAvailable) {
          timetableToday.push(lesson)
        }
      })
    })
    this.setState({
      timetableToday
    })
  },
  getIndexCardData() {
    if (app.isLogin()) {
      this.getTimetable()
      this.getCard()
      this.getBorrow()
    } else {
      setTimeout(() => {
        this.getIndexCardData()
      }, 500)
    }
  },
  getData() {
    this.getAnnouncement()
    this.getIndexCardData()
  },
  onPullDownRefresh () {
    if (app.isLogin()) {
      this.getData()
    } else {
      this.showTip('请先登录')
    }
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },
  getAnnouncement() {
    app.services.getAnnouncement((res) => {
      const data = res.data.data
      const announcementId = app.get('announcementId') || 0
      if (announcementId < data.id) {
        this.setState({
          helpStatus: true
        })
        app.set('announcementId', data.id)
      }
    }, {
      showError: false
    })
  },
  getTimetable() {
    app.services.getTimetable(undefined, {
      showError: false
    })
  },
  getBorrow () {
    app.services.getBorrow(undefined, {
      showError: false
    })
  },
  getCard() {
    app.services.getCard(undefined, {
      showError: false
    })
  },
  showTip(content, duration = 1500) {
    this.setState({
      tinyTip: {
        active: true,
        content: content
      }
    })

    setTimeout(() => {
      this.hideTip()
    }, duration)
  },
  hideTip() {
    this.setState({
      tinyTip: {
        active: false,
        content: ''
      }
    })
  },
  onClickApp(e) {
    const commonData = app.$store.getCommonState()
    const isLogin = !!commonData['token']
    const target = e.currentTarget
    const index = target.dataset.index
    const appItem = this.data.apps[index]
    if(!isLogin) {
      return this.showTip('请先登录')
    }
    if(appItem.disabled) {
      return this.showTip('服务暂不可用')
    }
    wx.navigateTo({
      url: appItem.route
    })
  }
})
