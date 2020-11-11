export default function toast(obj) {
  if (obj.icon === "error") {
    obj.image = "/images/common/close-white.png";
  }
  wx.showToast(obj);
}
