import logger from "./logger";

export default function toast(obj) {
  if (obj.icon === "error") {
    obj.image = "/images/common/close-white.png";
  }

  try {
    const app = getApp();
    const userInfo = app && app.$store.getState("session", "userInfo");

    if (userInfo) {
      wx.reportAnalytics("toast", {
        uno: userInfo ? userInfo.uno : "null",
        toast_content: obj.title,
        toast_type: obj.icon || "success",
      });
    }
  } catch (err) {
    logger.error("toast", "toast 埋点上报异常", err);
  }

  wx.showToast(obj);
}
