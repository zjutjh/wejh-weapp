import {
  endpoints,
  setCustomEndpoint,
  unsetCustomEndpoint,
} from "../../utils/api";

let app = getApp();

Page({
  data: {
    openId: "",
    token: "",
    logSize: 0,
    storageSize: 0,
    maxStorageSize: 0,
    idDev: false,
  },
  onLoad() {
    const info = wx.getStorageInfoSync() || {};
    const { currentSize: storageSize, limitSize: maxStorageSize } = info;
    this.setData({
      openId: app.isDev ? app.$store.getCommonState("openid") || "" : "",
      token: app.isDev ? app.$store.getCommonState("token") || "" : "",
      storageSize: storageSize,
      maxStorageSize: maxStorageSize,
      isDev: app.isDev,
    });
  },
  switchAPIEndpoint() {
    let endpointNames = endpoints.map((endpoint) => endpoint.name);
    endpointNames.unshift("Default");
    wx.showActionSheet({
      itemList: endpointNames,
      success({ tapIndex }) {
        if (tapIndex === 0) {
          if (unsetCustomEndpoint()) {
            wx.showModal({
              title: "提示",
              content: "恢复默认环境成功，请重启小程序",
              showCancel: false,
            });
          } else {
            app.toast({
              icon: "error",
              title: "修改环境失败",
            });
          }
        } else {
          if (setCustomEndpoint(endpoints[tapIndex - 1].url)) {
            wx.showModal({
              title: "提示",
              content: "修改环境成功，请重启小程序",
              showCancel: false,
            });
          } else {
            app.toast({
              icon: "error",
              title: "修改环境失败",
            });
          }
        }
      },
    });
  },
  setOpenId(event) {
    const { value } = event.detail;
    if (value) {
      app.$store.setCommonState({
        openId: value,
      });
      app.toast({
        icon: "success",
        title: "修改成功",
      });
    }
  },
  copyOpenId() {
    wx.setClipboardData({
      data: app.$store.getCommonState("openid") || "",
      success() {
        app.toast({
          icon: "success",
          title: "复制成功",
        });
      },
    });
  },
  setToken(event) {
    const { value } = event.detail;
    if (value) {
      app.$store.setCommonState({
        token: value,
      });
      app.toast({
        icon: "success",
        title: "修改成功",
      });
    }
  },
  copyToken() {
    wx.setClipboardData({
      data: app.$store.getCommonState("token") || "",
      success() {
        app.toast({
          icon: "success",
          title: "复制成功",
        });
      },
    });
  },
  clearCommonStorage() {
    wx.removeStorage({
      key: "common",
      success() {
        wx.showModal({
          title: "提示",
          content: "清除数据成功，请重启小程序",
          showCancel: false,
        });
      },
      fail() {
        app.toast({
          icon: "error",
          title: "清除数据失败",
        });
      },
    });
  },
  clearStaticStorage() {
    wx.removeStorage({
      key: "static",
      success() {
        wx.showModal({
          title: "提示",
          content: "清除数据成功，请重启小程序",
          showCancel: false,
        });
      },
      fail() {
        app.toast({
          icon: "error",
          title: "清除数据失败",
        });
      },
    });
  },
  clearAllStorage() {
    wx.clearStorage({
      success() {
        wx.showModal({
          title: "提示",
          content: "清除数据成功，请重启小程序",
          showCancel: false,
        });
      },
      fail() {
        app.toast({
          icon: "error",
          title: "清除数据失败",
        });
      },
    });
  },
  disableDebugMenu() {
    app.set("devMenuEnabled", false);
    wx.navigateBack();
  },
});
