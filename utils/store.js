import logger from "./logger";

export default class WejhStore {
  /**
   * 创建一个通用存储对象
   */
  constructor(options = {}) {
    const { debug = false, fields: store = {} } = options;

    Object.assign(this, {
      debug,
      store,
      observers: {},
    });

    for (const field in this.store) {
      this.store[field].isPersistent = this.store[field].isPersistent
        ? true
        : false;
      if (this.store[field].isPersistent) {
        var storageData = {};
        try {
          storageData = this.readFromLocalStorage(field);
        } catch (err) {
          logger.warn(
            `Failed to read key '${field}' from local storage with error: `,
            err
          );
        }
        this.store[field].data = Object.assign(
          {},
          storageData,
          this.store[field].data
        );
      } else {
        this.store[field].data = {};
      }
    }
  }

  /**
   * 将页面的 data 字段与存储对象中的页面状态进行连接
   */
  connect(page, field) {
    let _this = this;

    page.field = field;

    /**
     * 移除页面内注册的观察者
     */
    page.disconnect = function () {
      _this.disconnect(page);
    };

    /**
     * 更新页面的状态
     */
    page.setPageState = function (value, callback = function () {}) {
      if (_this.debug) {
        logger.debug("store", `setPageState called with: `, value);
      }

      // 如果是 Page 类型，同时把数据更新到 data 中，并请求重新渲染，数据会被最终写入 Data 域
      if (this.setData) {
        // 更新到 data 中
        this.setData(value);
      }
      // if (_this.debug) {
      //   console.log(`currentData: `, this.data);
      // }

      callback();
    }.bind(page);

    /**
     * 观察存储对象中的字段，并立即将现有的状态值同步到页面状态中
     */
    page.observe = function (
      remoteField,
      remoteKey,
      localKey,
      callback = function () {}
    ) {
      if (!localKey) {
        localKey = remoteKey;
      }
      // 对当前域观察 targetField 域的 targetState，同步到 localState 中
      _this.observe(this, field, remoteField, remoteKey, localKey, callback);
      // 用存储中的初始数据更新当前状态
      const targetState = _this.getState(remoteField, remoteKey) || null;
      if (targetState || !(localKey in this.data)) {
        page.setPageState(
          {
            [localKey]: targetState,
          },
          callback
        );
      }
    }.bind(page);
  }

  /**
   * 移除页面内注册的观察者
   */
  disconnect(page) {
    if (page.field) {
      for (let remoteField in this.observers) {
        if (this.debug) {
          logger.debug(
            "store",
            `Remove observation to ${remoteField} for ${page.field}`
          );
        }
        delete this.observers[remoteField][page.field];
      }
    } else {
      logger.error("store", `Failed to determine field for page`);
    }
  }

  /**
   * 为页面注册观察者
   */
  observe(
    page,
    localField,
    remoteField,
    remoteKey,
    localKey,
    callback = function () {}
  ) {
    const remoteFieldObservers = this.observers[remoteField] || {};
    const localFieldObserver = remoteFieldObservers[localField] || {
      page: page,
      keyMap: {},
      callbackMap: {},
    };

    localFieldObserver.keyMap[localKey] = remoteKey;
    localFieldObserver.callbackMap[localKey] = callback;

    remoteFieldObservers[localField] = localFieldObserver;
    this.observers[remoteField] = remoteFieldObservers;
  }

  /**
   * 向观察者通知状态变更
   */
  notifyObservers(field, value) {
    const observerForField = this.observers[field];
    for (let localField in observerForField) {
      const item = observerForField[localField];

      const { page, keyMap, callbackMap } = item;

      for (let localKey in keyMap) {
        const remoteKey = keyMap[localKey];
        if (value[remoteKey]) {
          const callback = callbackMap[localKey];
          const targetState = value[remoteKey] || null;

          page.setPageState(
            {
              [localKey]: targetState,
            },
            callback
          );
        }
      }
    }
  }

  /**
   * 获取特定域的状态值
   */
  getState(field, key) {
    return key ? this.store[field].data[key] : this.store[field].data;
  }

  /**
   * 为特定域的状态赋值
   */
  setState(field, value) {
    if (this.debug) {
      logger.debug(
        "store",
        `setState called with field: ${field}, value: `,
        value
      );
    }

    this.notifyObservers(field, value);

    value = {
      ...this.store[field].data,
      ...value,
    };
    this.store[field].data = value;
    if (this.store[field].isPersistent) {
      try {
        this.writeToLocalStorage(field, value);
      } catch (err) {
        logger.warn(
          `Failed to write key '${field}' to local storage with error: `,
          err
        );
      }
    }
  }

  /**
   * 写入特定域的数据到本地存储
   * @throws
   */
  writeToLocalStorage(field, value) {
    return wx.setStorageSync(field, value);
  }

  /**
   * 从本地存储读出特定数据域的值
   * @throws
   */
  readFromLocalStorage(field) {
    return wx.getStorageSync(field) || {};
  }
}
