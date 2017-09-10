import API from './api'
import util from './util'

export default function ({ store, fetch }) {
  return {
    getAppList (callback = function () {}, options) {
      fetch({
        url: API('app-list'),
        ...options,
        success(res) {
          let data = res.data.data
          store.setCommonState({
            apps: util.fixAppList(data['app-list']),
            icons: util.fixIcons(data['icons'])
          })
        }
      })
    },
    getTimetable (callback = function () {}, options) {
      fetch({
        url: API('timetable'),
        ...options,
        success(res) {
          let data = res.data.data
          store.setCommonState({
            timetable: data,
            timetableFixed: util.fixTimetable(data)
          })
          callback(res)
        }
      })
    },
    getScore (callback = function () {}, options) {
      fetch({
        url: API('score'),
        ...options,
        success(res) {
          const data = res.data.data
          const fixedData = util.fixScore(data)
          const sortedData = Array.from(fixedData.list).sort((a, b) => {
            return b['真实成绩'] - a['真实成绩']
          })
          store.setCommonState({
            score: fixedData,
            sortedScoreList: sortedData,
          })
          callback(res)
        }
      })
    },
    changeTimetableTerm (targetTerm, callback = function () {}, options) {
      fetch({
        url: API('timetable'),
        method: 'PUT',
        ...options,
        data: {
          term: targetTerm,
        },
        showError: true,
        success(res) {
          callback(res)
        }
      })
    },
    changeScoreTerm (targetTerm, callback = function () {}, options) {
      fetch({
        url: API('score'),
        method: 'PUT',
        ...options,
        data: {
          term: targetTerm,
        },
        showError: true,
        success(res) {
          callback(res)
        }
      })
    },
  }
}