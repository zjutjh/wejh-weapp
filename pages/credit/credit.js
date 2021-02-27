import termUtil from "../../utils/termPicker";
import formatter from "../../utils/formatter";

const app = getApp();
var credit;
var gpa;
var scorenum = [];
var arr = new Array(100);
for (var i = 1; i < arr.length + 1; i++) {
  arr[i - 1] = i;
}
Page({
  data: {
    sort: false,
    hideScore: false,
    hideInfo: false,

    currentTerm: "",
    lastUpdated: "暂无成绩",

    isdelete: false,
    termPickerData: {
      range: [["选择学年"], ["选择学期"], "类别"],
      value: [0, 0, 0],
    },

    gpa: 0,
    // scorenum:[1,2,3],
    creditPickerData: {
      range: [1, 2, 3, 4, 5, 6],
      value: 3,
    },
    // scorePickerData:{
    range: [["百分制", "五级制"], scorenum],
    value: [0, 59],
    // },

    score1: {
      gpa: 3.46,
      list: [
        {
          名称: "高等数学",
          考试性质: "正常考试",
          学分: "5",
          成绩: "81",
          课程性质名称: "必修课",
          课程归属名称: "",
          ischeck: true,
        },
        {
          名称: "大学英语",
          考试性质: "正常考试",
          学分: "4",
          成绩: "80",
          课程性质名称: "必修课",
          课程归属名称: "",
          ischeck: true,
        },
        {
          名称: "体育",
          考试性质: "正常考试",
          学分: "1",
          成绩: "85",
          课程性质名称: "体育课",
          课程归属名称: "",
          ischeck: true,
        },
        {
          名称: "工程创新实践与伦理",
          考试性质: "正常考试",
          学分: "2.0",
          成绩: "优秀",
          课程性质名称: "任选课",
          课程归属名称: "创新创业",
          ischeck: true,
        },
        {
          名称: "心理健康与自我成长",
          考试性质: "正常考试",
          学分: "2.0",
          成绩: "80",
          课程性质名称: "选修课",
          课程归属名称: "社会责任",
          ischeck: true,
        },
      ],
    },
  },
  onLoad() {
    // var scorePickerData = this.data.scorePickerData;
    var range = this.data.range;
    range[1] = arr;
    this.setData({
      // scorePickerData: scorePickerData,
      range: range,
    });
    // this.setPageState({
    //   scorePickerData: scorePickerData1,
    // });

    app.$store.connect(this, "score");

    this.observe("session", "icons");
    this.observe("session", "userInfo");
    this.observe("session", "isLoggedIn");
    this.observe("session", "time");
    this.observe("session", "score", "score", (newValue) => {
      if (!(newValue && newValue.score)) {
        return;
      }
      // 请求返回后, 更新学期和上次更新时间
      const { lastUpdated, term } = newValue.score;
      const termInfo = termUtil.getInfoFromTerm(term);
      this.setPageState({
        termInfo: termInfo,
        currentTerm: termUtil.getPrettyTermStr(termInfo),
        lastUpdated: formatter.formatLastUpdate(lastUpdated),
      });
      credit = this.data.score1.list.reduce((a, b) => a + b["学分"] * 1, 0);
      this.setData({
        // gpa : gpa,
        credit: credit,
      });
      this.getGpa();
    });

    // this.observe("session", "scoreDetail", "scoreDetail", (newValue) => {
    //   if (!(newValue && newValue.scoreDetail)) {
    //     return;
    //   }
    //   // 请求返回后, 更新学期和上次更新时间
    //   const { lastUpdated, term } = newValue.scoreDetail;
    //   const termInfo = termUtil.getInfoFromTerm(term);
    //   this.setPageState({
    //     termInfoDetail: termInfo,
    //     currentTermDetail: termUtil.getPrettyTermStr(termInfo),
    //     lastUpdatedScoreDetail: formatter.formatLastUpdate(lastUpdated),
    //   });
    // });

    // 判断是否登录
    if (!this.data.isLoggedIn) {
      return wx.redirectTo({
        url: "/pages/login/login",
      });
    }

    // 判断是否绑定正方
    if (!this.data.userInfo.ext.passwords_bind.zf_password) {
      return wx.redirectTo({
        url: "/pages/bind/zf",
      });
    }

    const termInfo = termUtil.getInfoFromTerm(this.data.time.term);

    let termPickerData = termUtil.getTermPickerData(grade, termInfo);
    termPickerData = {
      range: [...termPickerData.range, ["总评", "分项"]],
      value: [...termPickerData.value, 0],
    };

    // 填充学期选择器数据
    const grade = parseInt(this.data.userInfo.uno.substring(0, 4));
    this.setPageState({
      termInfo: termInfo,
      currentTerm: termUtil.getPrettyTermStr(termInfo),
      termPickerData: termPickerData,
    });

    // 判断是否有数据
    if (!this.data.score) {
      wx.showLoading({
        title: "获取成绩中",
        mask: true,
      });

      const _this = this;
      app.services.getScore(
        termInfo,
        () => {
          _this.hideLoading();
        },
        {
          showError: true,
        }
      );
    }
  },
  onUnload() {
    this.disconnect();
  },
  hideLoading() {
    // wx.hideLoading 会把错误 toast 一并关掉，导致错误提示消失太快看不到，因此暂时在这里需要加一个延迟
    // 后续会对此处进行优化，loading 状态和错误提示都不使用 toast，避免 block 住用户的行为
    setTimeout(() => {
      wx.hideLoading();
    }, 500);
  },
  // toggleRefresh() {
  //   const _this = this;

  //   const isDetail = this.data.score && this.data.score.isDetail;
  //   if (isDetail) {
  //     wx.showLoading({
  //       title: "获取成绩中",
  //       mask: true,
  //     });
  //     app.services.getScoreDetail(this.data.termInfoDetail, () => {
  //       _this.hideLoading();
  //     });
  //   } else {
  //     wx.showLoading({
  //       title: "获取成绩中",
  //       mask: true,
  //     });
  //     app.services.getScore(this.data.termInfo, () => {
  //       _this.hideLoading();
  //     });
  //   }
  // },

  toggleDelete(e) {
    var isdelete = this.data.isdelete;
    this.setData({
      isdelete: !isdelete,
    });
  },

  toggleDeletescore(e) {
    const index = e.currentTarget.dataset.index;
    var score1 = this.data.score1;
    if (score1.list[index].ischeck == true) {
      credit = credit - score1.list[index]["学分"];
    }
    score1.list.splice(index, 1);
    // this.setData({
    //   credit : credit,
    // })
    this.setPageState({
      score1: score1,
    });

    this.setData({
      credit: credit,
    });
    this.getGpa();
  },

  toggleChangeCredit(e) {
    const element = e.currentTarget.dataset;
    const index = e.currentTarget.dataset.index;
    const score1 = this.data.score1;
    if (score1.list[index].ischeck == true) {
      // console.log(element.item.ischeck);
      credit -= element.item["学分"] * 1.0;
      score1.list[index].ischeck = false;
    } else {
      // console.log(element.item.ischeck);
      credit += element.item["学分"] * 1.0;
      score1.list[index].ischeck = true;
    }
    this.setData({
      credit: credit,
    });
    this.setPageState({
      score1: score1,
    });
    this.getGpa();
  },

  onCreditPickerChange(e) {
    console.log("picker发送选择改变，携带值为", e.detail.value);
    const index = e.currentTarget.dataset.index;
    var score1 = this.data.score1;

    score1.list[index]["学分"] = this.data.creditPickerData.range[
      e.detail.value
    ];
    this.setPageState({
      score1: score1,
    });
    credit = this.data.score1.list.reduce((a, b) => a + b["学分"] * 1, 0);
    this.setData({
      //   value: e.detail.value, //此处会报错，原因暂未知
      credit: credit,
    });
    this.getGpa();
  },

  onScorePickerChange(e) {
    console.log("picker发送选择改变，携带值为", e.detail.value);
    const index = e.currentTarget.dataset.index;
    var score1 = this.data.score1;

    score1.list[index]["成绩"] = this.data.range[1][e.detail.value[1]];
    this.setPageState({
      score1: score1,
    });
    this.getGpa();
  },
  onScoreColumnChange(e) {
    // console.log(e.detail);
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      range: this.data.range,
      value: this.data.value,
    };
    data.value[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (e.detail.value) {
          case 0:
            data.range[1] = arr;
            data.value[1] = 59;
            console.log(0);
            break;
          case 1:
            data.range[1] = ["不合格", "合格", "及格", "良好", "优秀"];
            data.value[1] = 3;
            console.log(1);
            break;
        }
        break;
    }
    this.setData(data);
    // this.setPageState(data);
  },

  addscore(e) {
    var score1 = this.data.score1;
    score1.list[score1.list.length] = {
      名称: "自定义",
      考试性质: "正常考试",
      学分: 2,
      成绩: 60,
      课程性质名称: "必修课",
      课程归属名称: "",
      ischeck: true,
    };
    this.setPageState({
      score1: score1,
    });
    credit = credit + 2;
    this.setData({
      credit: credit,
    });
    this.getGpa();
  },

  // onScorePickerChange:function(e){
  //   console.log(e.detail.value)
  //   // this.setData({
  //   //   value : e.detail.value
  //   // })

  //   var score1 = this.data.score1;
  //   score1.list[score1.list.length] = {
  //     "名称" : "自定义",
  //     "学分" : e.detail.value[0]+1,
  //     "成绩" : e.detail.value[2]+1,
  //     ischeck : true
  //   }
  //   this.setPageState({
  //     score1: score1,
  //   });

  //   credit = this.data.score1.list.reduce((a,b)=>a+b['学分']*1,0);
  //   this.setData({
  //     credit : credit,
  //   })
  // },

  onTermPickerChange: function (e) {
    const { range } = this.data.termPickerData;
    const termInfo = {
      year: range[0][e.detail.value[0]].substring(0, 4),
      semester: e.detail.value[1] + 1,
    };

    const isDetail = e.detail.value[2] === 1;

    wx.showLoading({
      title: "获取成绩中",
      mask: true,
    });
    const _this = this;
    if (isDetail) {
      app.services.getScoreDetail(termInfo, () => {
        _this.hideLoading();
      });
    } else {
      app.services.getScore(termInfo, () => {
        _this.hideLoading();
      });
    }
    this.getGpa();
  },

  getGpa() {
    const score = this.data.score;
    const score1 = this.data.score1;
    if (score.list.length == 0) {
      return 0;
    }
    if (score.list == null || !typeof score.list === "object") {
      return 0;
    }
    var zcj = 0;
    var zxf = 0;

    function isset(e) {
      if (typeof e != "undefined" && e !== null) {
        return true;
      } else {
        return false;
      }
    }
    // function array_get(array, key, def = null){
    //   if (is_null(key)) {
    //     return array;
    //   }

    //   if (isset(array[key])) {
    //     return array[key];
    //   }

    //   foreach (explode('.', $key) as $segment) {
    //     if (! is_array(array) || ! array_key_exists($segment, array)) {
    //         return value(def);
    //     }

    //     $array = array[$segment];
    //   }
    //   return array;
    // }
    score1.list.forEach((element) => {
      //此处改变gpa
      console.log(element["名称"]);
      if (element.ischeck == false) {
        return;
      }
      if (
        !isset(element["考试性质"]) ||
        element["考试性质"] == "公选课" ||
        element["成绩"] == "取消" ||
        (isset(element["考试性质"]) &&
          (element["考试性质"] === "重修" || element["考试性质"] === "补考")) ||
        (isset(element["课程归属名称"]) &&
          element["课程归属名称"] !== "个性化课程" &&
          element["课程归属名称"] &&
          isset(element["课程性质名称"]) &&
          element["课程性质名称"] === "任选课") ||
        (isset(element["课程归属名称"]) &&
          (element["课程归属名称"] === "科学素养" ||
            element["课程归属名称"] === "人文情怀" ||
            element["课程归属名称"] === "社会责任" ||
            element["课程归属名称"] === "国际视野" ||
            element["课程归属名称"] === "新生研讨课" ||
            element["课程归属名称"] === "创新创业"))
      ) {
        console.log(1);
        return;
      }

      // if (array_get(element, '名称', null) === '党的基本知识') {
      //   console.log(2)
      //   return;
      // }
      if (element["名称"] === "党的基本知识") {
        console.log(2);
        return;
      }
      //同下
      var a = element["学分"];
      var d = parseFloat(a);
      if (!isNaN(a)) {
        a = d;
      }
      //
      if (
        !isset(a) ||
        !(typeof a == "number") ||
        element["成绩"] == "免修" ||
        element["成绩"] == "缓考"
      ) {
        console.log(3);
        return;
      }
      //appdata传的内容都是字符串，需要手动区分一下
      var b = element["成绩"];
      var c = parseFloat(b);
      if (!isNaN(c)) {
        b = c;
      }
      //
      console.log(typeof b);
      if (!(typeof b == "number")) {
        switch (b) {
          case "优秀":
            b = 4.5;
            break;
          case "良好":
            b = 3.5;
            break;
          case "中等":
            b = 2.5;
            break;
          case "及格":
            b = 1.5;
            break;
          case "通过":
            b = 1;
            break;
          default:
            b = 0;
        }
      } else {
        if (b <= 5 && b > 0) {
        } else {
          b = 60 <= b ? (b - 50) / 10 : 0;
        }
      }
      console.log(b);
      zcj += b * element["学分"];
      zxf += 1 * element["学分"];
    });

    if (zxf == 0) {
      gpa = 0;
    } else {
      gpa = (zcj / zxf).toFixed(3);
    }
    this.setData({ gpa });
  },
});
