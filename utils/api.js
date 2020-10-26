// const prefix = {
//   dev: 'http://wejh-server.test/',
//   preview: 'https://test.server.wejh.imcr.me/',
//   production: 'https://server.wejh.imcr.me/'
// }
const prefix = 'https://server.wejh.imcr.me/';

const systemInfo = wx.getSystemInfoSync()
const isDev = systemInfo.platform === 'devtools'

const apiMap = {
  'app-list': 'api/app-list',
  'announcement': 'api/announcement',
  'login': 'api/login',
  'user': 'api/user',
  'forgot': 'api/forgot',
  'code': 'api/code/weapp',
  'autoLogin': 'api/autoLogin',
  'register': 'api/register',
  'time': 'api/time',
  'timetable': 'api/ycjw/timetable',
  'score': 'api/ycjw/score',
  'scoreDetail': 'api/ycjw/scoreDetail',
  'teacher': 'api/teacher',
  'exam': 'api/ycjw/exam',
  'borrow': 'api/library/borrow',
  'card': 'api/card',
  'freeroom': 'api/freeroom',
  'zf/bind': 'api/zf/bind',
  'ycjw/bind': 'api/ycjw/bind',
  'card/bind': 'api/card/bind',
  'library/bind': 'api/library/bind',
}

/**
 * @return {string}
 */
function API(key) {
  // const app = getApp()
  // let preview = false
  // if (app) {
  //   preview = app.isPreview()
  // }
  // const domain = preview ? prefix['preview'] : isDev ? prefix['dev'] : prefix['production']
  const domain = prefix;
  const url = domain + apiMap[key]
  // console.log((preview ? '体验环境 ' : '') + (isDev ? '开发环境 ' : '') + url)
  return url
}

export default API
