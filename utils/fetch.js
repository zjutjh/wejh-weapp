import toast from './toast'
export default function ({$store, isDev}) {
  return function fetch(object) {
    const commonData = $store.getCommonState()
    const token = commonData.token || ''
    if (token) {
      object.header = Object.assign({}, object.header, {
        Authorization: 'Bearer ' + token
      })
    }

    if(!object.header) {
      object.header = {}
    }

    object.header['content-type'] = object.header['content-type'] || 'application/json'

    const success = object.success || function () {}
    const fail = object.fail || function () {}
    object.success = (res) => {
      console.log(object)
      console.log(res)
      if (typeof res.data !== 'object') {
        object.showError && toast({
          icon: 'error',
          duration: 2000,
          title: '服务器错误'
        })

        return fail(res)
      }
      const data = res.data
      if(data.errcode < 0) {
        console.error(data)
        object.showError && toast({
          icon: 'error',
          duration: 2000,
          title: data.errmsg || '请求错误'
        })
        if (object.back) {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
        if (object.showError && data.redirect) {
          return wx.navigateTo({
            url: data.redirect
          })
        }

        return fail(res)
      }

      success(res)

      if (object.showError && data.redirect) {
        return wx.navigateTo({
          url: data.redirect
        })
      }
    }
    object.fail = (err) => {
      console.log(object)
      console.error(err)
      object.showError && toast({
        icon: 'error',
        duration: 2000,
        title: '请求错误'
      })
      if (object.back) {
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
      }
    }

    //if (isDev) {
    //  console.log(object)
    //}

    wx.request(object)
  }
}
