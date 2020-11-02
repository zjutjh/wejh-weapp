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
    let _this = this;
    app.$store.connect(this, "freeroom");
    this.observeCommon("freeroom");
    this.observeCommon("userInfo");
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

      // 判断是否有成绩数据
      if (!this.data.freeroom) {
        this.getFreeroom(this.afterGetFreeroom);
      } else {
        this.afterGetFreeroom();
      }
    }, 600);
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
    this.setState(
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
});
