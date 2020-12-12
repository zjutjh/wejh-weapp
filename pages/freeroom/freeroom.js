const app = getApp();

const _weekday = ["一", "二", "三", "四", "五", "六", "日"];
const _weeks = [
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

Page({
  data: {
    form: {
      area: "02",
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
    this.observe("session", "userInfo", null, () => {
      if (!this.data.userInfo.ext.passwords_bind.zf_password) {
        wx.redirectTo({
          url: "/pages/bind/zf",
        });
        return;
      }
      this.getFreeRoom(this.afterGetFreeRoom);
    });
    this.observe("session", "freeroom");
  },
  onUnload() {
    this.disconnect();
  },
  chooseOption(event) {
    const { type, value } = event.currentTarget.dataset;

    const form = this.data.form;
    form[type] = value;
    if (+form["endTime"] < +form["startTime"]) {
      if (type === "endTime") {
        form["startTime"] = form["endTime"];
      } else {
        form["endTime"] = form["startTime"];
      }
    }
    this.setPageState(
      {
        form,
      },
      () => {
        this.getFreeRoom(this.afterGetFreeRoom);
      }
    );
  },
  getFreeRoom(callback) {
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
