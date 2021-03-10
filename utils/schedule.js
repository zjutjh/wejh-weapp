import logger from "./logger";

import dayjs from "../libs/dayjs/dayjs.min.js";
import dayjs_customParseFormat from "../libs/dayjs/plugin/customParseFormat.js";
import dayjs_isBetween from "../libs/dayjs/plugin/isBetween.js";

dayjs.extend(dayjs_customParseFormat);
dayjs.extend(dayjs_isBetween);

const schedule = {
  c0: { begin: "0:00", end: "7:59" }, //休息
  c1: { begin: "8:00", end: "8:45" },
  c1p: { begin: "8:46", end: "8:54" }, //下课
  c2: { begin: "8:55", end: "9:40" },
  c2p: { begin: "9:41", end: "9:54" }, //下课
  c3: { begin: "9:55", end: "10:40" },
  c3p: { begin: "10:41", end: "10:54" }, //下课
  c4: { begin: "10:50", end: "11:35" },
  c4p: { begin: "11:36", end: "11:44" }, //下课
  c5: { begin: "11:45", end: "12:30" },
  c5p: { begin: "12:31", end: "13:29" }, //休息，午饭
  c6: { begin: "13:30", end: "14:15" },
  c6p: { begin: "14:16", end: "14:24" }, //下课
  c7: { begin: "14:25", end: "15:10" },
  c7p: { begin: "15:11", end: "15:24" }, //下课
  c8: { begin: "15:25", end: "16:10" },
  c8p: { begin: "16:11", end: "16:24" }, //下课
  c9: { begin: "16:25", end: "17:05" },
  c9p: { begin: "17:06", end: "18:29" }, //休息，晚饭
  c10: { begin: "18:30", end: "19:15" },
  c10p: { begin: "19:16", end: "19:24" }, //下课
  c11: { begin: "19:25", end: "20:10" },
  c11p: { begin: "20:11", end: "20:24" }, //下课
  c12: { begin: "20:25", end: "21:10" },
  c12p: { begin: "21:11", end: "23:59" }, //休息
};

const getCurrentPeriod = () => {
  return getPeriodFromDate(Date());
};

const getPeriodFromDate = (date) => {
  for (const periodKey in schedule) {
    const period = schedule[periodKey];
    if (
      dayjs(date).isBetween(
        dayjs(period.begin, "H:mm"),
        dayjs(period.end, "H:mm"),
        "minute",
        "[]"
      )
    ) {
      return {
        key: periodKey,
        ...period,
      };
    }
  }
  logger.error("schedule", "No period key found for date: ", date);
  return null;
};

module.exports = {
  getCurrentPeriod,
  getPeriodFromDate,
  schedule,
};
