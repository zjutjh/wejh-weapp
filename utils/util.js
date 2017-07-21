function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//判断是否为纯粹对象
function isPlainObject(obj) {
  if (!obj || obj.toString() !== "[object Object]" || obj.nodeType || obj.setInterval) {
    return false;
  }
  if (obj.constructor && !obj.hasOwnProperty("constructor") && !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  for (var key in obj) { }
  return key === undefined || obj.hasOwnProperty(key);
}

function deepClone(obj) {
  if (!isPlainObject(obj)) { return false; }
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  formatTime: formatTime,
  deepClone: deepClone,
}
