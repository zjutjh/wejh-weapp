import dayjs from "../libs/dayjs/dayjs.min.js";

import dayjs_isoWeek from "../libs/dayjs/plugin/isoWeek.js";
import dayjs_duration from "../libs/dayjs/plugin/duration.js";

import logger from "./logger";

dayjs.extend(dayjs_isoWeek);
dayjs.extend(dayjs_duration);

const weekMap = ["", "一", "二", "三", "四", "五", "六", "日"];

const formatLastUpdate = (timestamp) => {
  const lastUpdate = dayjs.unix(timestamp);

  if (!lastUpdate.isValid()) {
    return "上次更新：未知";
  }

  const currentTime = dayjs();

  const duration = dayjs.duration(currentTime.diff(lastUpdate));
  logger.info("formatter", "数据时间差", duration);

  if (duration.asSeconds() < 60) {
    return "刚刚更新";
  } else if (duration.asMinutes() < 60) {
    return `${Math.floor(duration.asMinutes())} 分钟前更新`;
  } else if (lastUpdate.isSame(currentTime, "day")) {
    return `上次更新：今天 ${lastUpdate.format("H:mm")}`;
  } else if (lastUpdate.isSame(currentTime.subtract(1, "day"), "day")) {
    return `上次更新：昨天 ${lastUpdate.format("H:mm")}`;
  } else if (lastUpdate.isSame(currentTime.subtract(2, "day"), "day")) {
    return `上次更新：前天 ${lastUpdate.format("H:mm")}`;
  } else if ((lastUpdate.isSame(currentTime), "isoWeek")) {
    return `上次更新：星期${
      weekMap[lastUpdate.isoWeekday()]
    } ${lastUpdate.format("H:mm")}`;
  } else {
    return `上次更新：${lastUpdate.format("YYYY-MM-DD H:mm")}`;
  }
};

module.exports = {
  formatLastUpdate,
};
