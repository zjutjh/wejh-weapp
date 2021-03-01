// Ref: https://juejin.cn/post/6844904041470754830

function downLoadAndUpdate(updateManager) {
  wx.showLoading();
  // 静默下载更新小程序新版本
  updateManager.onUpdateReady(function () {
    wx.hideLoading();
    wx.reportAnalytics("update_prompt", {
      update_event_name: "success",
    });
    updateManager.applyUpdate();
  });
  updateManager.onUpdateFailed(function () {
    wx.hideLoading();
    wx.reportAnalytics("update_prompt", {
      update_event_name: "failed",
    });
    wx.showModal({
      title: "新版本下载成功",
      content: "新版本下载成功，请您退出微精弘，重新搜索打开哟~",
      showCancel: false,
    });
  });
}

export default function autoUpdate() {
  if (wx.canIUse("getUpdateManager")) {
    const updateManager = wx.getUpdateManager();
    // 1. 检查小程序是否有新版本发布
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {
        // 检测到新版本，需要更新，给出提示
        wx.showModal({
          title: "更新提示",
          content: "检测到新版本，是否立即更新微精弘？",
          success: function (res) {
            if (res.confirm) {
              // 2. 用户确定下载更新小程序，小程序下载及更新静默进行
              wx.reportAnalytics("update_prompt", {
                update_event_name: "confirm",
              });
              downLoadAndUpdate(updateManager);
            } else if (res.cancel) {
              wx.reportAnalytics("update_prompt", {
                update_event_name: "cancel",
              });
            }
          },
        });
      } else {
        wx.reportAnalytics("update_prompt", {
          update_event_name: "no_update",
        });
      }
    });
  } else {
    wx.reportAnalytics("update_prompt", {
      update_event_name: "unsupported",
    });
  }
}
