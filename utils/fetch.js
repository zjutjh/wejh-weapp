export default function ($store) {
  return function fetch(object) {
    const commonData = $store.store.common
    const token = commonData.token || ''
    if (token) {
      object.header = Object.assign({}, object.header, {
        Authorization: 'Bearer ' + token
      })
    }

    if(object.showError) {
      const success = object.success || function () {}
      const fail = object.fail || function () {}
      object.success = (res) => {
        if (typeof res.data !== 'object') {
          wx.showToast({
            image: '/images/common/close-white.png',
            duration: 2000,
            title: '服务器错误'
          })

          return fail(res)
        }
        const data = res.data
        if(data.errcode < 0) {
          wx.showToast({
            image: '/images/common/close-white.png',
            duration: 2000,
            title: data.errmsg || '请求错误'
          })

          return fail(res)
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