import WejhStore from "./utils/store";
import Fetch from "./utils/fetch";
import BadgeManager from "./utils/badgeManager";
import toast from "./utils/toast";
import Services from "./utils/services";
import logger from "./utils/logger";
import envConfig from "./env";
import dayjs from "./libs/dayjs/dayjs.min.js";
import dayjs_customParseFormat from "./libs/dayjs/plugin/customParseFormat.js";

dayjs.extend(dayjs_customParseFormat);

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

const badgeManager = BadgeManager({
  store,
});

App({
  name: "微精弘",
  version,
  versionType: versionTypeName,
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
      this.services.getOpenId(
        () => {
          _this.autoLogin();
          afterLogin();
        },
        {
          data: {
            code,
          },
        }
      );
    }
  },
  reportUserInfo(userInfo) {
    try {
      const lastUpdate = dayjs(userInfo.updated_at, "YYYY-MM-DD hh:mm:ss");
      if (!lastUpdate.isValid()) {
        throw "`update_at` is invalid";
      }
      const daysDiff = dayjs().diff(lastUpdate, "day");

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
          toast({
            icon: "error",
            title: "获取用户登录态失败！" + res.errMsg,
          });
          return;
        }
        callback(res.code, afterLogin);
      },
    });
  },
  autoLogin() {
    const openId = store.getState("common", "openId");
    openId &&
      this.services.autoLogin(
        (res) => {
          toast({
            title: "自动登录成功",
          });
          const { user: userInfo } = res.data.data;
          this.reportUserInfo(userInfo);
        },
        {
          data: {
            type: "weapp",
            openid: openId,
          },
        }
      );
  },
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
  $store: store,
  badgeManager,
});
