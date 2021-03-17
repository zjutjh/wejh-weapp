import Timer from "../../../utils/timer";
import logger from "../../../utils/logger";

import { schedule } from "../../../utils/schedule";

import dayjs from "../../../libs/dayjs/dayjs.min.js";

import dayjs_customParseFormat from "../../../libs/dayjs/plugin/customParseFormat.js";
import dayjs_isBetween from "../../../libs/dayjs/plugin/isBetween.js";
import dayjs_duration from "../../../libs/dayjs/plugin/duration.js";

dayjs.extend(dayjs_customParseFormat);
dayjs.extend(dayjs_isBetween);
dayjs.extend(dayjs_duration);

const app = getApp();

Component({
  properties: {
    timetable: {
      type: Object,
      value: null,
      observer: function (newVal, oldVal) {
        this.updateTodayTimetable();
      },
    },
    images: {
      type: Object,
      value: null,
    },
  },
  data: { _timer: null },
  lifetimes: {
    created() {
      this.data._timer = new Timer({
        interval: 60 * 1000,
        firesAtExactMinutes: true,
        callback: () => {
          this.updateHintForTodayTimetable();
        },
      });
    },
    attached() {
      app.$store.connect(this, "today-timetable");
      this.observe("session", "time");

      this.data._timer.start();
    },
    detached() {
      this.data._timer.stop();
      this.disconnect();
    },
  },
  pageLifetimes: {
    show() {
      this.data._timer.start();
    },
    hide() {
      this.data._timer.stop();
    },
  },
  methods: {
    updateTodayTimetable() {
      const { timetable, time } = this.data;
      if (!timetable || !time) {
        return;
      }

      const { day: weekday, week } = this.data.time;

      const todayTimetable = timetable["classes"][weekday - 1];
      const timetableToday = [];

      todayTimetable.forEach((lessons) => {
        lessons.forEach((lesson) => {
          const isAvailable = lesson["周"][week];
          if (isAvailable) {
            timetableToday.push(lesson);
          }
        });
      });

      console.log(timetableToday);

      this.setData({
        timetableToday,
      });

      this.updateHintForTodayTimetable();
    },
    updateHintForTodayTimetable() {
      try {
        logger.info("today-timetable", "刷新今日课表状态");

        if (!this.data.timetableToday) {
          return;
        }

        let shouldHintNextLesson = true;
        let hasInLessonHint = false;

        const timetableToday = this.data.timetableToday.map((lesson) => {
          const startTime = dayjs(
            schedule[`c${lesson["开始节"]}`].begin,
            "H:mm"
          );
          const endTime = dayjs(schedule[`c${lesson["结束节"]}`].end, "H:mm");
          const currentTime = dayjs();

          const isInLesson = currentTime.isBetween(
            startTime,
            endTime,
            "minute",
            "[]"
          );

          if (isInLesson) {
            // 正在上课
            hasInLessonHint = true;

            // const duration = dayjs.duration(endTime.diff(currentTime));

            // const formattedHint =
            //   duration.asMinutes() < 60
            //     ? `${Math.ceil(duration.asMinutes())}分钟`
            //     : `${duration.add({ seconds: 59 }).format("H小时mm分")}`; // 解决 rounding 问题

            lesson["课程提示"] = {
              icon: lesson["课程图标"],
              content: "正在上课",
              color: "blue",
            };
          } else if (shouldHintNextLesson) {
            const isBefore = currentTime.isBefore(startTime, "minute");

            if (isBefore > 0) {
              // 还没上课
              shouldHintNextLesson = false;

              const duration = dayjs.duration(startTime.diff(currentTime));
              const isInOneHour = duration.asMinutes() < 60;

              lesson["课程提示"] = {
                icon: isInOneHour ? "rush" : "clock",
                content: `还有${
                  isInOneHour
                    ? `${Math.ceil(duration.asMinutes())}分钟`
                    : `${duration.add({ seconds: 59 }).format("H小时mm分")}` // 解决 rounding 问题
                }上课`,
                color: hasInLessonHint ? "" : isInOneHour ? "red" : "blue",
              };
            }
          }
          return lesson;
        });

        this.setPageState({
          timetableToday,
        });
      } catch (e) {
        wx.reportMonitor("2", 1);
        logger.error("updateHintForTodayTimetable failed with: ", e);
      }
    },
  },
});
