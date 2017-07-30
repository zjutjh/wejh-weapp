const prefix = 'http://wejh-server.dev/'

const api = {
  'app-list': 'api/app-list',
  'score': 'api/ycjw/score'
}

/**
 * @return {string}
 */
function API(key) {
  return prefix + api[key]
}

export default API