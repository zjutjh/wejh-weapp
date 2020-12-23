import { endpoints, defaultEndpoint } from "../env";

const customEndpointKey = "custom_api_endpoint";

let customEndpoint = (() => {
  const endpoint = wx.getStorageSync(customEndpointKey);
  return endpoint && typeof endpoint === "string" ? endpoint : "";
})();

const apiMap = {
  "app-list": "api/app-list",
  announcement: "api/announcement",
  bootstrap: "api/bootstrap",
  login: "api/login",
  user: "api/user",
  forgot: "api/forgot",
  code: "api/code/weapp",
  autoLogin: "api/autoLogin",
  register: "api/register",
  time: "api/time",
  timetable: "api/ycjw/timetable",
  score: "api/ycjw/score",
  scoreDetail: "api/ycjw/scoreDetail",
  teacher: "api/teacher",
  exam: "api/ycjw/exam",
  borrow: "api/library/borrow",
  card: "api/card",
  freeroom: "api/freeroom",
  "zf/bind": "api/zf/bind",
  "ycjw/bind": "api/ycjw/bind",
  "card/bind": "api/card/bind",
  "library/bind": "api/library/bind",
};

function setCustomEndpoint(url) {
  if (typeof url === "string") {
    try {
      wx.setStorageSync(customEndpointKey, url);
      customEndpoint = url;
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function unsetCustomEndpoint() {
  try {
    wx.removeStorageSync(customEndpointKey);
    customEndpoint = "";
    return true;
  } catch {
    return false;
  }
}

/**
 * @return {string}
 */
function API(key) {
  const domain = customEndpoint || defaultEndpoint;
  const url = domain + apiMap[key];
  return url;
}

module.exports = {
  API,
  endpoints: endpoints || [],
  setCustomEndpoint,
  unsetCustomEndpoint,
};
