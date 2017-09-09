import API from './api'
import util from './util'

export default function ({ store, fetch }) {
  return {
    getTimetable(callback = function () {}) {
      fetch({
        url: API('timetable'),
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
    changeTimetableTerm(targetTerm, callback = function () {}) {
      fetch({
        url: API('timetable'),
        method: 'PUT',
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