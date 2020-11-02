export default class WeappStore {
  constructor(store, options = {}) {
    this.commonKey = options.commonKey || "common";
    this.debug = options.debug || false;
    this.ctx = {};
    this.observer = {};
    this.store = store;
    this.setStore(this.commonKey, store.common || {});
  }

  connect(ctx, field) {
    let _this = this;
    this.ctx[field] = ctx; // 储存上下文

    // 初始化当前域的数据
    this.setStore(field, Object.assign({}, this.getStore(field), ctx.data));

    // 为该上下文增加方法
    ctx.setState = function (obj, callback = function () {}) {
      _this._setState(field, obj);
      if (ctx.setData) {
        ctx.setData(obj);
      }

      _this._refreshObserver(field);

      callback();
    }.bind(ctx);

    ctx.observe = function (
      tagetField,
      targetState,
      localState,
      callback = function () {}
    ) {
      if (!localState) {
        localState = targetState;
      }
      _this.observe(field, tagetField, targetState, localState, callback);
      ctx.setState({
        [localState]: _this.getStore(tagetField)[targetState],
      });
    }.bind(ctx);

    ctx.observeCommon = function (
      targetState,
      localState,
      callback = function () {}
    ) {
      ctx.observe(_this.commonKey, targetState, localState, callback);
    }.bind(ctx);

    // 初始化该上下文的数据
    ctx.setState(this.getStore(field) || {});
  }

  observe(
    localField,
    targetField,
    targetState,
    localState,
    callback = function () {}
  ) {
    const observer = this.observer[targetField] || {};
    const localObserver = observer[localField] || {
      ctx: localField,
      data: {},
      callback: {},
    };
    localObserver.data[localState] = targetState;
    localObserver.callback[localState] = callback;

    observer[localField] = localObserver;
    this.observer[targetField] = observer;
  }

  _refreshObserver(field) {
    const observerObj = this.observer[field];
    for (let key in observerObj) {
      const item = observerObj[key];
      const ctx = this.ctx[item.ctx];
      const data = item.data;
      const callbacks = item.callback;

      const newState = {};
      const callbackArr = [];
      for (let localState in data) {
        const targetKey = data[localState];
        const callback = callbacks[localState];
        const targetState = this.getStore(field)[targetKey];
        newState[localState] = targetState;
        callbackArr.push(callback);
      }
      ctx.setState(newState, () => {
        callbackArr.forEach((callback) => {
          callback();
        });
      });
    }
  }

  setStore(key, value) {
    if (key === this.commonKey || this.debug) {
      wx.setStorageSync(key, value);
    } else {
      this.store[key] = value;
    }
  }

  getStore(key) {
    if (key === this.commonKey || this.debug) {
      return wx.getStorageSync(key) || {};
    } else {
      return this.store[key];
    }
  }

  getCommonState(key) {
    const commonData = this.getStore(this.commonKey);
    if (key) {
      return commonData[key];
    }
    return commonData;
  }

  setCommonState(obj) {
    this.setFieldState(this.commonKey, obj);
  }

  _setState(field, obj) {
    this.setStore(field, Object.assign(this.getStore(field), obj || {}));
  }

  setFieldState(field, obj) {
    this.ctx[field] &&
      this.ctx[field].setState &&
      this.ctx[field].setState(obj);
  }
}
