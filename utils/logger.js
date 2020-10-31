import { formatTime } from "./util";

export default class logger {
  static info(tag, ...messages) {
    console.info(`${formatTime(new Date())} [${tag}]: `, ...messages);
  }
  static debug(tag, ...messages) {
    console.debug(`${formatTime(new Date())} [${tag}]: `, ...messages);
  }
  static warn(tag, ...messages) {
    console.warn(`${formatTime(new Date())} [${tag}]: `, ...messages);
  }
  static error(tag, ...messages) {
    console.error(`${formatTime(new Date())} [${tag}]: `, ...messages);
  }
}
