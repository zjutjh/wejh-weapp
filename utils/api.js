const prefix = 'http://wejh-server.dev/'

const api = {
  'app-list': 'api/app-list',
  'login': 'api/login',
  'code': 'api/code/weapp',
  'autoLogin': 'api/autoLogin',
  'register': 'api/register',
  'time': 'api/time',
  'score': 'api/ycjw/score'
}

/**
 * @return {string}
 */
function API(key) {
  return prefix + api[key]
}

export default API