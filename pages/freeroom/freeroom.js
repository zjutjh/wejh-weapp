import { getCurrentPeriod } from "../../utils/schedule";

const app = getApp();

const _weekday = ["", "一", "二", "三", "四", "五", "六", "日"];
const _weeks = [
  "",
  "第一周",
  "第二周",
  "第三周",
  "第四周",
  "第五周",
  "第六周",
  "第七周",
  "第八周",
  "第九周",
  "第十周",
  "十一周",
  "十二周",
  "十三周",
  "十四周",
  "十五周",
  "十六周",
  "十七周",
  "十八周",
  "十九周",
  "二十周",
];

const startTimeArr = [];
for (let i = 0; i < 12; i++) {
  startTimeArr.push({
    text: `从第${i + 1}节`,
    value: `${i}`,
  });
}

const endTimeArr = [];
for (let i = 0; i < 12; i++) {
  endTimeArr.push({
    text: `到第${i + 1}节`,
    value: `${i}`,
  });
}

const weekdayArr = _weekday.map((weekDay, idx) => {
  return {
    text: `星期${weekDay}`,
    value: `${idx}`,
  };
});

const weekArr = _weeks.map((week, idx) => {
  return {
    text: `${week}`,
    value: `${idx}`,
  };
});

const periodRangeMap = {
  c0: { startTime: 0, endTime: 1 }, //     第 1 节前,   默认查询  1-2 节的空教室
  c1: { startTime: 0, endTime: 1 }, //     第 1 节中,   默认查询  1-2 节的空教室
  c1p: { startTime: 2, endTime: 2 }, //    第 1 节课间, 默认查询第  2 节的空教室
  c2: { startTime: 2, endTime: 3 }, //     第 2 节中,   默认查询  3-4 节的空教室
  c2p: { startTime: 2, endTime: 3 }, //    第 2 节课间, 默认查询  3-4 节的空教室
  c3: { startTime: 2, endTime: 3 }, //     第 3 节中,   默认查询  3-4 节的空教室
  c3p: { startTime: 3, endTime: 3 }, //    第 3 节课间, 默认查询第  4 节的空教室
  c4: { startTime: 3, endTime: 3 }, //     第 4 节中,   默认查询第  4 节的空教室
  c4p: { startTime: 4, endTime: 4 }, //    第 4 节课间, 默认查询第  5 节的空教室
  c5: { startTime: 4, endTime: 4 }, //     第 5 节中,   默认查询第  5 节的空教室
  c5p: { startTime: 5, endTime: 6 }, //    第 5 节课间, 默认查询  6-7 节的空教室
  c6: { startTime: 5, endTime: 6 }, //     第 6 节中,   默认查询  6-7 节的空教室
  c6p: { startTime: 6, endTime: 6 }, //    第 6 节课间, 默认查询第  7 节的空教室
  c7: { startTime: 7, endTime: 8 }, //     第 7 节中,   默认查询  8-9 节的空教室
  c7p: { startTime: 7, endTime: 8 }, //    第 7 节课间, 默认查询  8-9 节的空教室
  c8: { startTime: 7, endTime: 8 }, //     第 8 节中,   默认查询  8-9 节的空教室
  c8p: { startTime: 8, endTime: 8 }, //    第 8 节课间, 默认查询第  9 节的空教室
  c9: { startTime: 8, endTime: 8 }, //     第 9 节中,   默认查询第  9 节的空教室
  c9p: { startTime: 9, endTime: 11 }, //   第 9 节课间, 默认查询 10-12节的空教室
  c10: { startTime: 9, endTime: 11 }, //   第 10 节中,  默认查询 10-12节的空教室
  c10p: { startTime: 10, endTime: 11 }, // 第 10 节课间,默认查询 11-12节的空教室
  c11: { startTime: 10, endTime: 11 }, //  第 11 节中,  默认查询 11-12节的空教室
  c11p: { startTime: 11, endTime: 11 }, // 第 11 节课间,默认查询第 12 节的空教室
  c12: { startTime: 11, endTime: 11 }, //  第 12 节中,  默认查询第 12 节的空教室
  c12p: { startTime: 0, endTime: 1 }, //   第 12 节课后,默认查询明天第1-2节的空教室
};

Page({
  data: {
    form: {
      area: "01",
      startTime: 0,
      endTime: 0,
      week: 1,
      weekday: 1,
    },
    optionsColor: {
      area: "yellow",
      startTime: "green",
      endTime: "red",
      week: "blue",
      weekday: "purple",
    },
    conditions: [
      [
        {
          name: "area",
          options: [
            {
              text: "朝晖校区",
              value: "01",
            },
            {
              text: "屏峰校区",
              value: "02",
            },
            {
              text: "莫干山\n校区",
              value: "03",
              badge: {
                path: "/index/freeroom/moganshan",
              },
            },
          ],
        },
      ],
      [
        {
          name: "startTime",
          options: startTimeArr,
        },
        {
          name: "endTime",
          options: endTimeArr,
        },
      ],
      [
        {
          name: "weekday",
          options: weekdayArr,
        },
      ],
      [
        {
          name: "week",
          options: weekArr,
        },
      ],
    ],
  },
  onLoad: function () {
    app.$store.connect(this, "freeroom");

    this.observe("session", "isLoggedIn");
    this.observe("session", "userInfo");
    this.observe("session", "time");
    this.observe("session", "freeroom");
    this.observe("session", "unclearedBadges");
    this.observe("static", "cachedFreeRoomForm");

    if (!this.data.isLoggedIn) {
      wx.redirectTo({
        url: "/pages/login/login",
      });
      return;
    }

    if (!this.data.userInfo.ext.passwords_bind.zf_password) {
      wx.redirectTo({
        url: "/pages/bind/zf",
      });
      return;
    }

    const currentPeriodKey = getCurrentPeriod().key;
    let { week, day: weekday } = this.data.time;

    if (week <= 0) {
      week = 1;
    }

    if (currentPeriodKey === "c12p") {
      if (weekday === 7) {
        if (week < _weeks.length) {
          week = week + 1;
        }
        weekday = 1;
      } else {
        weekday = weekday + 1;
      }
    }

    const oldForm = this.data.form;

    const form = {
      ...oldForm,
      ...this.data.cachedFreeRoomForm,
      ...periodRangeMap[currentPeriodKey],
      week,
      weekday,
    };

    this.setPageState(
      {
        form,
      },
      () => {
        this.getFreeRoom();
      }
    );
  },
  onUnload() {
    this.disconnect();
  },
  chooseOption(event) {
    const { type, value, badgePath } = event.currentTarget.dataset;

    try {
      wx.reportAnalytics("freeroom_options", {
        uno: this.data.userInfo.uno,
        freeroom_option_name: type,
        freeroom_option_value: value,
      });
    } catch (err) {
      logger.error("app", "空教室埋点上报异常", err);
    }

    if (badgePath) {
      app.badgeManager.clearBadge(badgePath);
    }

    const form = this.data.form;
    form[type] = value;
    if (+form["endTime"] < +form["startTime"]) {
      if (type === "endTime") {
        form["startTime"] = form["endTime"];
      } else {
        form["endTime"] = form["startTime"];
      }
    }

    app.$store.setState("static", { cachedFreeRoomForm: form });

    this.setPageState(
      {
        form,
      },
      () => {
        this.getFreeRoom();
      }
    );
  },
  getFreeRoom(callback = this.afterGetFreeRoom) {
    wx.showLoading({
      title: "获取空教室中",
    });
    app.services.getFreeRoom(callback, {
      showError: true,
      data: this.data.form,
    });
  },
  afterGetFreeRoom() {
    wx.hideLoading();
  },
});
