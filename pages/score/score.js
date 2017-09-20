let app = getApp()

Page({
  data: {
    sort: false,
    sortAnimation: false,
    hideScore: false,
    hideInfo: false,
    showLoading: true,
    currentTerm: ''
  },
  onLoad () {
    let _this = this
    app.$store.connect(this, 'score')
    this.observeCommon('score')
    this.observeCommon('sortedScoreList')
    this.observeCommon('icons')
    this.observeCommon('userInfo')
    setTimeout(() => {
      // 判断是否登录
      if (!app.isLogin() || !this.data.userInfo) {
        return wx.redirectTo({
          url: '/pages/login/login'
        })
      }
      const year = this.data.userInfo.uno.slice(0, 4)
      if (year <= 2013) {
        // 判断是否绑定原创
        if (!this.data.userInfo.ext.passwords_bind.yc_password) {
          return wx.redirectTo({
            url: '/pages/bind/ycjw'
          })
        }
      } else {
        // 判断是否绑定正方
        if (!this.data.userInfo.ext.passwords_bind.zf_password) {
          return wx.redirectTo({
            url: '/pages/bind/zf'
          })
        }
      }

      // 判断是否有成绩数据
      if (!this.data.score) {
        this.getScore(this.afterGetScore)
      } else {
        this.afterGetScore()
      }
    }, 500)
  },
  toggleHideScore () {
    this.setState({
      hideScore: !this.data.hideScore
    })
  },
  toggleHideInfo () {
    this.setState({
      hideInfo: !this.data.hideInfo
    })
  },
  toggleSort () {
    this.setState({
      sortAnimation: true,
      sort: !this.data.sort
    })

    setTimeout(() => {
      this.setState({
        sortAnimation: false
      })
    }, 500)
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
  },
  switchTerm (e) {
    const _this = this
    const dataset = e.currentTarget.dataset
    const term = this.data.currentTerm;
    const termArr = term.match(/(\d+)\/(\d+)\((\d)\)/);
    let targetTerm;
    if (dataset.direction === 'left') {
      if (+termArr[3] === 1) {
        targetTerm = (parseInt(termArr[1]) - 1) + '/' + (parseInt(termArr[2]) - 1) + '(2)';
      } else {
        targetTerm = parseInt(termArr[1]) + '/' + parseInt(termArr[2]) + '(1)';
      }
    } else if (dataset.direction === 'right') {
      if (+termArr[3] === 1) {
        targetTerm = parseInt(termArr[1]) + '/' + parseInt(termArr[2]) + '(2)';
      } else {
        targetTerm = (parseInt(termArr[1]) + 1) + '/' + (parseInt(termArr[2]) + 1) + '(1)';
      }
    }
    wx.showLoading({
      title: '切换学期中'
    })
    app.services.changeScoreTerm(targetTerm, () => {
      app.services.getScore(() => {
        wx.hideLoading()
        _this.afterGetScore()
      })
    })
  },
})
