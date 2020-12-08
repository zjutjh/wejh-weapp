let app = getApp();
const groups = new Array('462530805', '282402782');
Page({
  data: {

  },
  onLoad() { },
  copy() {
    wx.showActionSheet({
      itemList: ['462530805（一群）', '282402782（二群）'],
      success({ tapIndex }) {
        wx.setClipboardData({
          data: groups[tapIndex],
        });
      },
    });
  },


});
