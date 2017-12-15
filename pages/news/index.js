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
  clipboard () {
    if (this.data.announcement && this.data.announcement.clipboard) {
      const text = this.data.announcement.clipboard
      const tip = this.data.announcement.clipboardTip
      wx.setClipboardData({
        data: text,
        success(){
          app.toast({
            icon: 'success',
            title: tip || '复制成功'
          })
        }
      })
    }
  },
  getData() {
    app.services.getAnnouncement()
  },
})
