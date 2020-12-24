import dayjs from "../libs/dayjs/dayjs.min.js";

const formattedLogTime = () => {
  return dayjs().format("YYYY-MM-DD hh:mm:ss");
};

export default class logger {
  static info(tag, ...messages) {
    console.info(`${formattedLogTime()} [${tag}]: `, ...messages);
  }
  static debug(tag, ...messages) {
    console.debug(`${formattedLogTime()} [${tag}]: `, ...messages);
  }
  static warn(tag, ...messages) {
    console.warn(`${formattedLogTime()} [${tag}]: `, ...messages);
  }
  static error(tag, ...messages) {
    console.error(`${formattedLogTime()} [${tag}]: `, ...messages);
  }
}
