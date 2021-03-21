const app = getApp();

Page({
  data: {
    campusList: {
      range: ["朝晖", "屏峰", "莫干山"],
      value: 0,
    },
    formValues: {},
    enterYear: {
      range: ["2015", "2016", "2017", "2018", "2019", "2020"],
      value: 0,
    },
    endYear: {
      range: ["2021", "2022", "2023", "2024", "2025"],
      value: 0,
    },
  },
  onLoad() {
    app.$store.connect(this, "profile");
    this.observe("session", "isLoggedIn");
    this.observe("session", "userInfo");
  },
  onUnload() {
    this.disconnect();
  },
  onCampusPickerChange(e) {
    this.setPageState({
      formValues: {
        ...this.data.formValues,
        ["school_info.area"]: this.data.campusList.range[e.detail.value],
      },
    });
  },
  onEnterYearPickerChange(e) {
    this.setPageState({
      formValues: {
        ...this.data.formValues,
        ["school_info.grade"]: this.data.enterYear.range[e.detail.value],
      },
    });
  },
  onEndYearPickerChange(e) {
    this.setPageState({
      formValues: {
        ...this.data.formValues,
        ["school_info.graduate_grade"]: this.data.endYear.range[e.detail.value],
      },
    });
  },
  onProfileSubmit() {},
});
