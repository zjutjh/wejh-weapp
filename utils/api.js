const prefix = 'http://wejh-server.dev/'

const api = {
  'app-list': 'api/app-list',
  'login': 'api/login',
  'register': 'api/register',
  'score': 'api/ycjw/score'
}

/**
 * @return {string}
 */
function API(key) {
  return prefix + api[key]
}

export default API