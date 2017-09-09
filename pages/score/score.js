let app = getApp()

Page({
  data: {
    showLoading: true,
    currentTerm: ''
  },
  onLoad () {
    let _this = this
    app.$store.connect(this, 'score')
    this.observeCommon('score')
    this.observeCommon('icons')
    this.observeCommon('userInfo')
    this.observeCommon('time')
    this.getScore()
  },
  getScore () {
    app.services.getScore(this.afterGetScore, {
      showError: true
    })
  },
  afterGetScore () {
    this.setState({
      showLoading: false
    })
    try {
      const scoreData = this.data.score
      const term = scoreData.term
      this.setState({
        currentTerm: term,
      })
    } catch(e) {
      console.error(e)
      app.toast({
        icon: 'error',
        title: e.message
      })
    }
  }
})
