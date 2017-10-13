const app = getApp()
Page({
  data: {
    newsTypeList: [
      {
        type: 'all',
        enabled: true
      },
      {
        type: 'new',
        enabled: false
      }
    ],
    newsTypeIndex: 0
  },
  onLoad: function () {
    app.$store.connect(this, 'news.index')
    this.observeCommon('userInfo')
    this.observeCommon('apps')
    this.observeCommon('icons')
    this.observeCommon('announcement')
    this.getData()
  },
  onClickNewsType(e) {
    const index = e.currentTarget.dataset.id
    const targetNewsType = this.data.newsTypeList[index]
    if (targetNewsType && targetNewsType.enabled) {

    } else {
      app.toast({
        icon: 'error',
        title: '暂未开放'
      })
    }
  },
  getData() {
    app.services.getAnnouncement()
  },
})
