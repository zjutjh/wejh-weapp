import toast from "./toast";
import logger from "./logger";

export default function ({ $store, isDev }) {
  return (object) => {
    const token = $store.getState("session", "token") || "";
    if (token) {
      object.header = Object.assign({}, object.header, {
        Authorization: "Bearer " + token,
      });
    }

    if (!object.header) {
      object.header = {};
    }

    object.header["content-type"] =
      object.header["content-type"] || "application/json";

    const success = object.success || function () {};
    const fail = object.fail || function () {};
    const complete = object.complete || function () {};

    object.success = (res) => {
      logger.info("fetch", object);
      logger.info("fetch", res);
      if (typeof res.data !== "object") {
        object.showError &&
          toast({
            icon: "error",
            duration: 2000,
            title: "服务器错误",
          });

        return fail(res);
      }

      const data = res.data;
      if (data.errcode < 0) {
        logger.error("fetch", data);
        object.showError &&
          toast({
            icon: "error",
            duration: 2000,
            title: data.errmsg || "请求错误",
          });
        // if (object.back) {
        //   setTimeout(() => {
        //     wx.navigateBack({
        //       delta: 1,
        //     });
        //   }, 2000);
        // }
        if (object.showError && data.redirect) {
          return wx.navigateTo({
            url: data.redirect,
          });
        }
        return fail(res);
      }

      success(res);

      if (object.showError && data.redirect) {
        return wx.navigateTo({
          url: data.redirect,
        });
      }
    };

    object.fail = (err) => {
      logger.info("fetch", object);
      logger.error("fetch", err);
      object.showError &&
        toast({
          icon: "error",
          duration: 2000,
          title: "请求错误",
        });
      // if (object.back) {
      //   setTimeout(() => {
      //     wx.navigateBack({
      //       delta: 1,
      //     });
      //   }, 2000);
      // }
      return fail(err);
    };

    object.complete = (res) => {
      complete(res);
    };

    return wx.request(object);
  };
}
