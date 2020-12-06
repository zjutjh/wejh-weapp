let app = getApp();
const groups = new Array('123', '234');
Page({
  data: {

  },
  onLoad() {},
  copy() {
    wx.showActionSheet({
      itemList: ['462530805（一群）', '282402782（二群）'],
      success({ tapIndex }) {
        wx.setClipboardData({
          data: groups[tapIndex],
          // success() {
          //   wx.showModal({
          //   title: "提示",
          //   icon: "success",
          //   showCancel: false,
          //   content: "复制成功",
          // });
          // },
        });
      },
    });
  },


});
