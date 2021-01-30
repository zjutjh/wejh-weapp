const app = getApp();

const groupInfo = [
  {
    name: "一群",
    id: "462530805",
  },
  {
    name: "二群",
    id: "282402782",
  },
];

Page({
  data: {},
  onLoad() {},
  onShow() {
    app.badgeManager.clearBadge("/home/feedback");
  },
  copyGroupId() {
    wx.showActionSheet({
      itemList: groupInfo.map((info) => `${info.id}（${info.name}）`),
      success({ tapIndex }) {
        wx.setClipboardData({
          data: groupInfo[tapIndex].id,
        });
      },
    });
  },
});
