const prefix = 'http://wejh-server.dev/'

const api = {
  'app-list': 'api/app-list',
  'login': 'api/login',
  'user': 'api/user',
  'forgot': 'api/forgot',
  'code': 'api/code/weapp',
  'autoLogin': 'api/autoLogin',
  'register': 'api/register',
  'time': 'api/time',
  'timetable': 'api/ycjw/timetable',
  'score': 'api/ycjw/score',
  'ycjw/bind': 'api/ycjw/bind',
  'card/bind': 'api/card/bind',
  'library/bind': 'api/library/bind',
}

/**
 * @return {string}
 */
function API(key) {
  return prefix + api[key]
}

export default API