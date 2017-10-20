import util from '../../utils/util'
let app = getApp()

Page({
  data: {
    timeline: [ //课程时间与指针位置的映射，{begin:课程开始,end:结束时间,top:指针距开始top格数}
      { begin: '0:00', end: '7:59', beginTop: -4, endTop: -4 }, //休息
      { begin: '8:00', end: '8:45', beginTop: 0, endTop: 100 },
      { begin: '8:46', end: '8:54', beginTop: 100, endTop: 100 }, //下课
      { begin: '8:55', end: '9:40', beginTop: 100, endTop: 200 },
      { begin: '9:41', end: '9:54', beginTop: 200, endTop: 200 }, //下课
      { begin: '9:55', end: '10:40', beginTop: 200, endTop: 300 },
      { begin: '10:41', end: '10:54', beginTop: 300, endTop: 300 }, //下课
      { begin: '10:50', end: '11:35', beginTop: 300, endTop: 400 },
      { begin: '11:36', end: '11:44', beginTop: 400, endTop: 400 }, //下课
      { begin: '11:45', end: '12:30', beginTop: 400, endTop: 500 },
      { begin: '12:31', end: '13:29', beginTop: 500, endTop: 500 }, //休息，午饭
      { begin: '13:30', end: '14:15', beginTop: 500, endTop: 600 },
      { begin: '14:16', end: '14:24', beginTop: 600, endTop: 600 }, //下课
      { begin: '14:25', end: '15:10', beginTop: 600, endTop: 700 },
      { begin: '15:11', end: '15:24', beginTop: 700, endTop: 700 }, //下课
      { begin: '15:25', end: '16:10', beginTop: 700, endTop: 800 },
      { begin: '16:11', end: '16:24', beginTop: 800, endTop: 800 }, //下课
      { begin: '16:25', end: '17:10', beginTop: 800, endTop: 900 },
      { begin: '17:11', end: '18:29', beginTop: 900, endTop: 900 }, //休息，晚饭
      { begin: '18:30', end: '19:15', beginTop: 900, endTop: 1000 },
      { begin: '19:16', end: '19:24', beginTop: 1000, endTop: 1000 }, //下课
      { begin: '19:25', end: '20:10', beginTop: 1000, endTop: 1100 },
      { begin: '20:11', end: '20:24', beginTop: 1100, endTop: 1100 }, //下课
      { begin: '20:25', end: '21:10', beginTop: 1100, endTop: 1200 },
      { begin: '21:11', end: '23:59', beginTop: 1200, endTop: 1300 } //休息
    ],
    showLoading: true,
    weekday: ['日', '一', '二', '三', '四', '五', '六', '日'],
    _weeks : ['未开学','第一周','第二周','第三周','第四周','第五周','第六周','第七周','第八周','第九周','第十周','十一周','十二周','十三周','十四周','十五周','十六周','十七周','十八周','十九周','二十周'],
    scroll: {
      top: 0,
      left: 0
    },
    viewStatus: 0,
    originWeek: 0,
    currentWeek: 1,
    currentTerm: '',
    timelineTop: 0,
    timelineLeft: 36,
    conflictLessons: [],
    targetLessons: [], // 悬浮的课程
    targetLessonInfo: {},
    targetIndex: 0,
    detailIndex: 0,
    timetable: []
  },
  onLoad: function () {
    let _this = this
    app.$store.connect(this, 'timetable')
    this.observeCommon('timetable', 'originalTimetableData')
    this.observeCommon('timetableFixed', 'timetable')
    this.observeCommon('userInfo')
    this.observeCommon('time')
    this.observeCommon('cacheStatus')
    this.startTimelineMoving()
    setTimeout(() => {
      const time = this.data.time || {}
      this.setState({
        viewStatus: time.week,
        originWeek: time.week || 1,
        currentWeek: time.week || 1
      })

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

      // 判断是否有课表数据
      if (!this.data.timetable) {
        this.getTimetable(this.afterGetTimetable)
      } else {
        this.afterGetTimetable()
      }
    }, 500)
  },
  setTitleTerm (term) {
    wx.setNavigationBarTitle({
      title: term + ' 课程表'
    })
  },
  startTimelineMoving () {
    const _this = this
    function parseMinute (dateStr) {
      return dateStr.split(':')[0] * 60 + parseInt(dateStr.split(':')[1]);
    }

    function compareDate (dateStr1, dateStr2) {
      return parseMinute(dateStr1) <= parseMinute(dateStr2);
    }
    const nowTime = _this.formatTime(new Date(), 'h:m')
    _this.data.timeline.forEach(function (e, i) {
      if (compareDate(e.begin, nowTime) && compareDate(nowTime, e.end)) {
        const timelineTop = Math.round(e.beginTop + (e.endTop - e.beginTop) * (parseMinute(nowTime) - parseMinute(e.begin)) / 100)
        _this.setState({
          timelineTop,
          timelineLeft: 36 + (_this.data.time.day - 1) * 130
        })
      }
    })
    setTimeout(() => {
      _this.startTimelineMoving()
    }, 60 * 1000)
  },
  showLessonDetail (e) {
    const dataset = e.currentTarget.dataset || {}
    const day = dataset.day
    const lesson = dataset.lesson
    const targetLessons = this.data.timetable[day][lesson].filter((item) => {
      return !!item['周'][this.data.currentWeek] || this.data.viewStatus === '*'
    })

    this.setState({
      targetLessons,
      targetLessonInfo: {
        weekday: `星期${this.data.weekday[day + 1]}`,
        lessonTime: `${lesson + 1}-${targetLessons[0]['节数'] + lesson}节`,
      }
    })
  },
  hideDetail (e) {
    if (e.target.dataset.type === 'mask') {
      this.setState({
        targetIndex: 0,
        targetLessons: [],
        targetLessonInfo: {}
      })
    }
  },
  onSwiper (e) {
    const index = e.detail.current
    this.setState({
      targetIndex: index
    })
  },
  afterGetTimetable () {
    this.setState({
      showLoading: false
    })
    try {
      const originalTimetableData = this.data.originalTimetableData
      const term = originalTimetableData.term
      this.getConflictLessons()
      this.setState({
        currentTerm: term,
      })
      this.setTitleTerm(term)
    } catch(e) {
      app.toast({
        icon: 'error',
        title: e.message
      })
    }
  },
  getConflictLessons () {
    const timetable = this.data.timetable
    const isConflictMap = []
    const conflictLessons = []
    // 开始循环周, i: 星期
    for (let i = 0; i < timetable.length; i++) {
      isConflictMap[i] = []
      conflictLessons[i] = []
      const dayLessons = timetable[i]
      // 开始循环节, k: 节
      for (let j = 0; j < dayLessons.length; j++) {
        isConflictMap[i][j] = []
        conflictLessons[i][j] = []
        let lesson = timetable[i][j]
        // 开始循环每节课
        for (let k = 0; k < lesson.length; k++) {
          let item = timetable[i][j][k]
          const weekStatus = item['周']
          weekStatus.forEach((status, index) => {
            conflictLessons[i][j][index] = isConflictMap[i][j][index] === true && !!status
            isConflictMap[i][j][index] = !!status
          })
          conflictLessons[i][j][0] = lesson.length > 1
        }
      }
    }

    this.setState({
      conflictLessons
    })
  },
  backCurrentWeek () {
    this.setState({
      currentWeek: this.data.time.week
    })
  },
  switchWeek(e) {
    const direction = e.currentTarget.dataset.direction
    let dValue = 0
    if (direction === 'left') {
      dValue = this.data.currentWeek === 1 ? 0 : -1
    } else if (direction === 'right') {
      dValue = this.data.currentWeek === 20 ? 0 : 1
    }
    this.setState({
      currentWeek: this.data.currentWeek + dValue
    })
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
    app.services.changeTimetableTerm(targetTerm, (res) => {
      const data = res.data.data
      const classTerm = data['class_term']
      app.services.getTimetable(() => {
        wx.hideLoading()
        _this.afterGetTimetable()
      })
    })
  },
  switchView() {
    app.toast({
      title: '试图切换中',
      icon: 'loading',
      duration: 500
    });
    this.setState({
      viewStatus: this.data.viewStatus === '*' ? this.data.currentWeek : '*'
    })
  },
  getTimetable(callback = function () {}) {
    let _this = this
    if (app.hasToken()) {
      app.services.getTimetable(callback, {
        showError: true,
        fail: () => {
          callback()
        }
      })
    } else {
      setTimeout(() => {
        _this.getTimetable()
      }, 800)
    }

  },
  //格式化时间
  formatTime (date, t) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    if (t === 'h:m') {
      return [hour, minute].map(this.formatNumber).join(':');
    } else {
      return [year, month, day].map(this.formatNumber).join('-') + ' ' + [hour, minute, second].map(this.formatNumber).join(':');
    }
  },
  formatNumber (n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
  }
})
