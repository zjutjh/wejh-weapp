
export default class WeappStore {
  constructor (store) {
    this.ctx = {}
    this.store = store
  }

  connect (ctx, filed) {
    let _this = this
    this.ctx[filed] = ctx // 储存上下文

    // 初始化当前域的数据
    this.store[filed] = Object.assign({}, this.store[filed], ctx.data)

    // 为该上下文增加方法
    ctx.setState = (function (obj, callback = function () {}) {
      _this._setState({
        [filed]: obj
      })
      if(ctx.setData) {
        ctx.setData(obj)
      }
      callback()
    }).bind(ctx)

    // 初始化该上下文的数据
    ctx.setState(this.store[filed] || {})
  }

  _setState (obj) {
    this.store = Object.assign(this.store, obj || {})
  }

  setFieldState (field, obj) {
    this.ctx[field] && this.ctx[field].setState && this.ctx[field].setState(obj)
  }
}