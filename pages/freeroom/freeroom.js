let app = getApp();

const _weekday = ["日", "一", "二", "三", "四", "五", "六", "日"];
const _weeks = [
  "未开学",
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

const weekdayArr = [];
for (let i = 1; i < 8; i++) {
  weekdayArr.push({
    text: `星期${_weekday[i]}`,
    value: `${i}`,
  });
}

const weekArr = [];
for (let i = 1; i <= 20; i++) {
  weekArr.push({
    text: `${_weeks[i]}`,
    value: `${i}`,
  });
}

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
    this.observe("session", "freeroom");
    this.observe("session", "userInfo");
    this.observe("session", "time");
    setTimeout(() => {
      // 判断是否登录
      if (!app.isLogin()) {
        return wx.redirectTo({
          url: "/pages/login/login",
        });
      }
      const year = this.data.userInfo.uno.slice(0, 4);
      if (year <= 2013) {
        // 判断是否绑定原创
        return app.toast({
          title: "毕业生暂不支持查空教室",
          duration: 3000,
          complete: () => {
            setTimeout(() => {
              wx.navigateBack({
                delta: 5,
              });
            }, 3000);
          },
        });
      } else {
        // 判断是否绑定正方
        if (!this.data.userInfo.ext.passwords_bind.zf_password) {
          return wx.redirectTo({
            url: "/pages/bind/zf",
          });
        }
      }

      // 判断是否有空教室数据
      if (!this.data.freeroom) {
        this.getFreeroom(this.afterGetFreeroom);
      } else {
        this.afterGetFreeroom();
      }
    }, 600);

    //获取当前时间
    const nowClass = this.formatTime(new Date(), "CurrentClass");
    this.data.form["startTime"] = nowClass + 1;
    this.data.form["endTime"] = nowClass + 2;
    this.data.form["week"] = this.data.time.week;
    this.data.form["weekday"] = this.data.time.day;
    //如果时间在12节课之后，零点之前，那么向后看一天
    //还未考虑跨周情况
    if (nowClass == -1) {
      if (this.data.time.day == 7) {
        this.data.form["weekday"] = 1;
      } else {
        this.data.form["weekday"] += 1;
      }
    }
    //刷新页面
    const form = this.data.form;
    this.setPageState(
      {
        form,
      },
      () => {
        this.getFreeroom();
      }
    );
    //更新滚动条位置

  },
  onUnload() {
    this.disconnect();
  },
  chooseOption(e) {
    const type = e.currentTarget.dataset.type;
    const value = e.currentTarget.dataset.value;
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
        this.getFreeroom();
      }
    );
  },

  getFreeroom(callback = this.afterGetFreeroom) {
    wx.showLoading({
      title: "获取空教室中",
    });
    app.services.getFreeroom(callback, {
      showError: true,
      data: this.data.form,
    });
  },
  afterGetFreeroom() {
    wx.hideLoading();
  },
  //格式化时间
  formatTime(date, t) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    //将当前时间转换为当前节数
    if (t === "CurrentClass") {
      switch (hour) {
        case 8:
          if (minute < 55) {
            return 1;
          } else {
            return 2;
          }
        case 9:
          if (minute < 55) {
            return 2;
          } else {
            return 3;
          }
        case 10:
          if (minute < 55) {
            return 3;
          } else {
            return 4;
          }
        case 11:
          if (minute < 44) {
            return 4;
          } else {
            return 5;
          }
        case 12:
          return 5;
        case 13:
          if (minute < 30) {
            return 5;
          } else {
            return 6;
          }
        case 14:
          if (minute < 25) {
            return 6;
          } else {
            return 7;
          }
        case 15:
          if (minute < 25) {
            return 7;
          } else {
            return 8;
          }
        case 16:
          if (minute < 25) {
            return 8;
          } else {
            return 9;
          }
        case 17:
          return 9;
        case 18:
          if (minute < 30) {
            return 9;
          } else {
            return 10;
          }
        case 19:
          if (minute < 25) {
            return 10;
          } else {
            return 11;
          }
        case 20:
          if (minute < 25) {
            return 11;
          } else {
            return 12;
          }
        default:
          if (hour > 20 && hour < 24) {
            return -1;
          } else if (hour >= 0 && hour < 8) {
            return 0;
          }
      }
    } else {
      return (
        [year, month, day].map(this.formatNumber).join("-") +
        " " +
        [hour, minute, second].map(this.formatNumber).join(":")
      );
    }
  },
  formatNumber(n) {
    n = n.toString();
    return n[1] ? n : "0" + n;
  },
});
