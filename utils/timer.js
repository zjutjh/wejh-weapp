export default class Timer {
  isStarted = false;

  _timeoutId = null;
  _intervalId = null;

  _callback = null;

  _interval = 1000;
  _firesAtStart = true;
  _firesAtExactMinutes = false;

  /**
   * Constructs a timer.
   * @param {Object} options - Options to the timer.
   * @param {number} [employee.interval=1000] - Interval to fire the timer (in milliseconds).
   * @param {boolean} [employee.firesAtExactMinutes=false] - If to fire the timer at exact minutes.
   * @param {boolean} [employee.firesAtStart=true] - If to fire the timer when it starts.
   * @param {function} [employee.callback=null] - The callback to run when timer fires.
   */
  constructor(options) {
    options.interval && (this._interval = options.interval);
    options._firesAtStart && (this._firesAtStart = options.firesAtStart);
    options.firesAtExactMinutes &&
      (this._firesAtExactMinutes = options.firesAtExactMinutes);
    options.callback && (this._callback = options.callback);
  }

  start() {
    this.stop();

    if (this._firesAtStart) {
      // Fire once before start
      this._callback && this._callback();
    }

    const doStart = () => {
      this._intervalId = setInterval(() => {
        this._callback && this._callback();
      }, this._interval);
    };

    if (this._firesAtExactMinutes) {
      const millisecondsToNextMinute = 60000 - (Date.now() % 60000);
      this._timeoutId = setTimeout(() => {
        this._callback && this._callback();
        doStart();
      }, millisecondsToNextMinute);
    } else {
      doStart();
    }
  }
  stop() {
    clearTimeout(this._timeoutId);
    clearInterval(this._intervalId);
  }
}
