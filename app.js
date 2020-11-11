import WeappStore from "./utils/store";
import Fetch from "./utils/fetch";
import { API } from "./utils/api";
import toast from "./utils/toast";
import Services from "./utils/services";
import logger from "./utils/logger";
import envConfig from "./env";

const store = new WeappStore(
  {
    common: {
      userInfo: null,
    },
  },
  {}
);

const env = (key) => envConfig[key];

const staticKey = "static";
const version = "1.0.18";

let versionType = "release";
let versionTypeName = "Release";

const systemInfo = wx.getSystemInfoSync();

if (typeof __wxConfig === "object") {
  let envVersion = __wxConfig.envVersion;
  switch (envVersion) {
    case "develop":
      versionType = "develop";
      versionTypeName = "Dev";
      break;
    case "trial":
      versionType = "beta";
      versionTypeName = "Beta";
      break;
  }
}

const isDev = versionType === "develop" || versionType === "beta";

if (isDev) {
  logger.info("app", "当前运行环境: " + versionType);
  logger.info("app", systemInfo);
}

const fetch = Fetch({
  $store: store,
  isDev,
});
const services = Services({
  fetch,
  store,
});

App({
  name: "微精弘",
  version,
  versionType: versionTypeName,
  onLaunch: function () {
    store.connect(this, "common");
    this.getData();
  },
  set(key, value) {
    const staticData = wx.getStorageSync(staticKey) || {};
    Object.assign(staticData, {
      [key]: value,
    });
    wx.setStorageSync(staticKey, staticData);
  },
  get(key) {
    const staticData = wx.getStorageSync(staticKey);
    return staticData[key];
  },
  getData() {
    this.getTermTime();
    this.getAppList();
    this.login(this.getOpenid);
  },
  getTermTime: (callback) => {
    fetch({
      url: API("time"),
      showError: true,
      success: (res) => {
        const result = res.data;
        store.setCommonState({
          time: result.data,
        });
        callback && callback();
      },
    });
  },
  getAppList() {
    services.getAppList();
  },
  getOpenid(code, afterLogin) {
    const _this = this;
    const openid = _this.get("openid");
    if (openid) {
      store.setCommonState({
        openid,
      });
      _this.autoLogin();
      return;
    }
    fetch({
      url: API("code"),
      data: {
        code,
      },
      method: "POST",
      showError: true,
      success: (res) => {
        const result = res.data;
        const openid = result.data.openid;
        store.setCommonState({
          openid,
        });
        _this.set("openid", openid);
        _this.autoLogin();
        afterLogin();
      },
    });
  },
  getUserInfo() {
    fetch({
      url: API("user"),
      showError: true,
      success: (res) => {
        const result = res.data;
        const userInfo = result.data;
        store.setCommonState({
          userInfo,
        });
      },
    });
  },
  isLogin() {
    return !!store.getCommonState("userInfo");
  },
  hasOpenid() {
    return !!store.getCommonState("openid");
  },
  hasToken() {
    return !!store.getCommonState("token");
  },
  reportUserInfo(userInfo) {
    try {
      const lastUpdateTime = Date.parse(userInfo.updated_at.split(" ")[0]);
      const daysDiff =
        (new Date().getTime() - lastUpdateTime) / (1000 * 3600 * 24);

      const grade = userInfo.uno.substring(0, 4)

      wx.reportAnalytics("user_login", {
        uno: userInfo.uno,
        grade: grade,
        timetable_term: userInfo.ext.terms.class_term,
        exam_term: userInfo.ext.terms.exam_term,
        score_term: userInfo.ext.terms.score_term,
        card_bind: userInfo.ext.passwords_bind.card_password,
        lib_bind: userInfo.ext.passwords_bind.lib_password,
        yc_bind: userInfo.ext.passwords_bind.yc_password,
        zf_bind: userInfo.ext.passwords_bind.zf_password,
        jh_bind: userInfo.ext.passwords_bind.jh_password,
        last_update: Math.floor(daysDiff),
      });
    } catch (err) {
      logger.error("app", "登录埋点上报异常", err);
    }
  },
  login(callback = this.getOpenid, afterLogin = function () {}) {
    wx.login({
      success: (res) => {
        if (!res.code) {
          return toast({
            icon: "error",
            title: "获取用户登录态失败！" + res.errMsg,
          });
        }
        callback(res.code, afterLogin);
      },
    });
  },
  autoLogin() {
    this.hasOpenid() &&
      fetch({
        url: API("autoLogin"),
        method: "POST",
        data: {
          type: "weapp",
          openid: store.getCommonState("openid"),
        },
        success: (res) => {
          const result = res.data;
          if (result.errcode > 0) {
            toast({
              title: "自动登录成功",
            });

            const { token, user: userInfo } = result.data;
            this.reportUserInfo(userInfo);

            store.setCommonState({
              token: token,
              userInfo: userInfo,
            });
          }
        },
      });
  },
  getWeappInfo: (cb) => {
    let that = this;
    const commonData = store.getCommonState();
    if (commonData.userInfo) {
      typeof cb === "function" && cb(commonData.userInfo);
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success(res) {
          const userInfo = res.userInfo;
          store.setCommonState({
            weappInfo: userInfo,
          });
          typeof cb === "function" && cb(userInfo);
        },
        fail() {
          toast({
            icon: "error",
            title: "获取用户信息失败",
          });
        },
      });
    }
  },
  goFeedback: () => {
    const userInfo = store.getCommonState("userInfo");
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        const networkType = res.networkType;
        const customData = {
          clientInfo: systemInfo.SDKVersion,
          clientVersion: systemInfo.version,
          os: systemInfo.platform,
          osVersion: systemInfo.system,
          netType: networkType,
          customInfo: JSON.stringify({
            uno: userInfo.uno,
            version,
          }),
        };
        logger.info("app", "跳转到反馈社区", customData);
        wx.navigateToMiniProgram({
          appId: "wx8abaf00ee8c3202e",
          extraData: {
            id: "19048",
            customData,
          },
        });
      },
    });
  },
  systemInfo,
  isDev: isDev,
  env,
  services,
  fetch,
  toast,
  $store: store,
});
