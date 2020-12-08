import WejhStore from "./utils/store";
import Fetch from "./utils/fetch";
import { API } from "./utils/api";
import toast from "./utils/toast";
import Services from "./utils/services";
import logger from "./utils/logger";
import envConfig from "./env";

const env = (key) => envConfig[key];

const version = "1.0.19";

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

const isDev = versionType === "develop";

if (isDev) {
  logger.info("app", "当前运行环境: " + versionType);
  logger.info("app", systemInfo);
}

const store = new WejhStore({
  debug: isDev,
  fields: {
    // session 域用于存储不可持久化的数据
    session: {
      isPersistent: false,
    },
    // common 域用于存放可持久化的、来源于请求的数据
    common: {
      isPersistent: true,
    },
    // static 域用于存储可持久化的，非来源于请求的数据
    static: {
      isPersistent: true,
    },
  },
});

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
  // set(key, value) {
  //   const staticData = wx.getStorageSync(staticKey) || {};
  //   Object.assign(staticData, {
  //     [key]: value,
  //   });
  //   wx.setStorageSync(staticKey, staticData);
  // },
  // get(key) {
  //   const staticData = wx.getStorageSync(staticKey);
  //   return staticData[key];
  // },
  onLaunch: function () {
    this.wxLogin(this.getOpenId, () => {
      logger.info("app", "自动登录成功");
    });
  },
  getOpenId(code, afterLogin) {
    const _this = this;
    const openId = store.getState("common", "openId");
    if (openId) {
      _this.autoLogin();
      afterLogin();
    } else {
      fetch({
        url: API("code"),
        data: {
          code,
        },
        method: "POST",
        showError: true,
        success: (res) => {
          const result = res.data;
          const openId = result.data.openid;
          store.setState("common", {
            openId,
          });
          _this.autoLogin();
          afterLogin();
        },
      });
    }
  },
  getUserInfo() {
    fetch({
      url: API("user"),
      showError: true,
      success: (res) => {
        const result = res.data;
        const userInfo = result.data;
        store.setState("session", {
          userInfo,
        });
      },
    });
  },
  isLogin() {
    return store.getState("session", "userInfo");
  },
  hasToken() {
    return store.getState("session", "token");
  },
  reportUserInfo(userInfo) {
    try {
      const lastUpdateTime = Date.parse(userInfo.updated_at.split(" ")[0]);
      const daysDiff =
        (new Date().getTime() - lastUpdateTime) / (1000 * 3600 * 24);

      const grade = userInfo.uno.substring(0, 4);

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
  wxLogin(callback = this.getOpenId, afterLogin = function () {}) {
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
    const openId = store.getState("common", "openId");
    openId &&
      fetch({
        url: API("autoLogin"),
        method: "POST",
        data: {
          type: "weapp",
          openid: openId,
        },
        success: (res) => {
          const result = res.data;
          if (result.errcode > 0) {
            toast({
              title: "自动登录成功",
            });

            const { token, user: userInfo } = result.data;
            this.reportUserInfo(userInfo);

            store.setState("session", {
              token: token,
              userInfo: userInfo,
            });
          }
        },
      });
  },
  // getWeappInfo: (cb) => {
  //   let that = this;
  //   const commonData = store.getCommonStore();
  //   if (commonData.userInfo) {
  //     typeof cb === "function" && cb(commonData.userInfo);
  //   } else {
  //     //调用登录接口
  //     wx.getUserInfo({
  //       withCredentials: false,
  //       success(res) {
  //         const userInfo = res.userInfo;
  //         store.setCommonState({
  //           weappInfo: userInfo,
  //         });
  //         typeof cb === "function" && cb(userInfo);
  //       },
  //       fail() {
  //         toast({
  //           icon: "error",
  //           title: "获取用户信息失败",
  //         });
  //       },
  //     });
  //   }
  // },
  // goFeedback: () => {
  //   const userInfo = store.getState("session", "userInfo");
  //   wx.getNetworkType({
  //     success: function (res) {
  //       // 返回网络类型, 有效值：
  //       // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
  //       const networkType = res.networkType;
  //       const customData = {
  //         clientInfo: systemInfo.SDKVersion,
  //         clientVersion: systemInfo.version,
  //         os: systemInfo.platform,
  //         osVersion: systemInfo.system,
  //         netType: networkType,
  //         customInfo: JSON.stringify({
  //           uno: userInfo.uno,
  //           version,
  //         }),
  //       };
  //       logger.info("app", "跳转到反馈社区", customData);
  //       wx.navigateToMiniProgram({
  //         appId: "wx8abaf00ee8c3202e",
  //         extraData: {
  //           id: "19048",
  //           customData,
  //         },
  //       });
  //     },
  //   });
  // },
  systemInfo,
  isDev: isDev,
  env,
  services,
  fetch,
  toast,
  $store: store,
});
