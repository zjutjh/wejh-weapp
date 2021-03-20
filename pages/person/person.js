// const { name } = require("dayjs/locale/*");

// const { name } = require("dayjs/locale/*");

const app = getApp();

Page({
  data: {
    dialogShow: false,
    buttons: [{ text: "取消" }, { text: "确定" }],
    inputModal: {
      title: "姓名",
      inputtips: "请输入姓名",
    },
    campusList: {
      range: ["朝晖", "屏峰", "莫干山"],
      value: 0,
    },
    personInfo: {
      学号: "",
      姓名: "",
      校区: "",
      入学年份: "",
      毕业年份: "",
    },
    enterYear: {
      range: ["2015", "2016", "2017", "2018", "2019", "2020"],
      value: 0,
    },
    endYear: {
      range: ["2021", "2022", "2023", "2024", "2025"],
      value: 0,
    },
    // },
  },
  onLoad: function () {
    // app.$store.connect(this, "binding");
    app.$store.connect(this, "home");
    this.observe("session", "userInfo");
    var personInfo = this.data.personInfo;
    personInfo["学号"] = this.data.userInfo.uno;
    this.setData({ personInfo });
    this.inputModal = this.selectComponent("#inputModal");
  },
  onUnload() {
    // this.disconnect();
  },

  onCampusPickerChange(e) {
    console.log("picker发送选择改变，携带值为", e.detail.value);
    var personInfo = this.data.personInfo;
    var campusList = this.data.campusList;
    personInfo["校区"] = campusList.range[e.detail.value];
    campusList.value = e.detail.value;
    this.setPageState({ campusList });
  },
  onEnterYearPickerChange(e) {
    console.log("picker发送选择改变，携带值为", e.detail.value);
    var personInfo = this.data.personInfo;
    var enterYear = this.data.enterYear;
    personInfo["入学年份"] = enterYear.range[e.detail.value];
    enterYear.value = e.detail.value;
    this.setPageState({ enterYear });
  },
  onEndYearPickerChange(e) {
    console.log("picker发送选择改变，携带值为", e.detail.value);
    var personInfo = this.data.personInfo;
    var endYear = this.data.endYear;
    personInfo["毕业年份"] = endYear.range[e.detail.value];
    endYear.value = e.detail.value;
    this.setPageState({ endYear });
  },

  // inputName() {
  //   this.inputModal.show();
  // },

  // bindbuttonConfirm(){
  //   var personInfo = this.data.personInfo;
  //   personInfo["姓名"] = this.inputModal.data.value;
  //   this.setData({personInfo})
  // },
  openConfirm: function () {
    this.setData({
      dialogShow: true,
    });
  },
  tapDialogButton(e) {
    this.setData({
      dialogShow: false,
    });
  },
  submit() {},
});
