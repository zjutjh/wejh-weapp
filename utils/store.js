
export default class WeappStore {
  constructor (store) {
    this.ctx = {}
    this.observer = {}
    this.store = store
  }

  connect(ctx, field) {
    let _this = this
    this.ctx[field] = ctx // 储存上下文

    // 初始化当前域的数据
    this.store[field] = Object.assign({}, this.store[field], ctx.data)

    // 为该上下文增加方法
    ctx.setState = (function (obj, callback = function () {}) {
      _this._setState({
        [field]: obj
      })
      if(ctx.setData) {
        ctx.setData(obj)
      }

      _this.refreshObserver(field)

      callback()
    }).bind(ctx)

    ctx.observe = (function (tagetField, targetState, localState) {
      if (!localState) {
        localState = targetState
      }
      _this.observe(field, tagetField, targetState, localState)
      ctx.setState({
        [localState]: _this.store[tagetField][targetState]
      })
    }).bind(ctx)

    // 初始化该上下文的数据
    ctx.setState(this.store[field] || {})
  }

  observe(localField, targetField, targetState, localState) {
    const observer = this.observer[targetField] || {}
    const localObserver = observer[localField] || {
      ctx: localField,
      data: {}
    }
    localObserver.data[localState] = targetState

    observer[localField] = localObserver
    this.observer[targetField] = observer
  }

  refreshObserver(field) {
    const observerObj = this.observer[field]
    for (let key in observerObj) {
      const item = observerObj[key]
      const ctx = this.ctx[item.ctx]
      const data = item.data
      
      const newState = {}
      for (let localState in data) {
        const targetKey = data[localState]
        const targetState = this.store[field][targetKey]
        newState[localState] = targetState
      }
      ctx.setState(newState)
    }
  }

  _setState (obj) {
    Object.assign(this.store, obj || {})
  }

  getFieldState (field) {
    if (!this.store[field]) {
      this.store[field] = {}
    }
    return this.store[field]
  }

  setFieldState (field, obj) {
    this.ctx[field] && this.ctx[field].setState && this.ctx[field].setState(obj)
  }
}