export default function ($store) {
  return function fetch(object) {
    console.log(object)
    const commonData = $store.store.common
    const token = commonData.token || ''
    if (token) {
      object.header = Object.assign({}, object.header, {
        Authorization: 'Bearer ' + token
      })
    }

    if(object.showError) {
      const success = object.success
      const fail = object.fail
      object.success = (res) => {
        const data = res.data
        if(data.errcode < 0) {

          wx.showToast({
            image: '/images/common/close-white.png',
            duration: 2000,
            title: data.errmsg || '请求错误'
          })
        }
        success(res)
      }
      object.fail = (err) => {
        wx.showToast({
          image: '/images/common/close-white.png',
          duration: 2000,
          title: '请求错误'
        })
      }
    }

    wx.request(object)
  }
}