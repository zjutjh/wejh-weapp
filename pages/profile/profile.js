import toast from "../../utils/toast";

const app = getApp();

/**
 * 用户个人信息编辑页,
 * 第一版本代码有点乱, 后续慢慢调整吧
 */

Page({
  data: {
    campusList: {
      range: ["朝晖", "屏峰", "莫干山"],
      value: 0,
    },
    formValues: {},
    enterYear: {
      range: [],
      value: 0,
    },
    endYear: {
      range: [],
      value: 0,
    },
  },
  onLoad() {
    app.$store.connect(this, "profile");
    this.observe("session", "userInfo");

    app.badgeManager.clearBadge("/home/profile_v1");

    const years = [...Array(99)].map((_, i) => {
      return i < 10 ? `200${i}` : `20${i}`;
    });

    const currentYear = new Date().getFullYear();
    const yearSelectedIndex = currentYear >= 2000 ? currentYear - 2000 : 0;
    this.setPageState({
      enterYear: {
        range: years,
        value: yearSelectedIndex,
      },
      endYear: {
        range: years,
        value: yearSelectedIndex,
      },
    });
  },
  onUnload() {
    this.disconnect();
  },
  enableUnloadAlert() {
    wx.enableAlertBeforeUnload({
      message: "您编辑的信息尚未保存，是否确认返回",
      fail: () => {},
    });
  },
  onNameInputChange(event) {
    const value = event.detail.value;
    this.setPageState({
      formValues: {
        "school_info.name": value,
      },
    });
  },
  onCampusPickerChange(e) {
    this.setPageState({
      formValues: {
        ...this.data.formValues,
        "school_info.area": this.data.campusList.range[e.detail.value],
      },
    });
    this.enableUnloadAlert();
  },
  onEnterYearPickerChange(e) {
    this.setPageState({
      formValues: {
        ...this.data.formValues,
        "school_info.grade": this.data.enterYear.range[e.detail.value],
      },
    });
    this.enableUnloadAlert();
  },
  onEndYearPickerChange(e) {
    this.setPageState({
      formValues: {
        ...this.data.formValues,
        "school_info.graduate_grade": this.data.endYear.range[e.detail.value],
      },
    });
    this.enableUnloadAlert();
  },
  onProfileSubmit() {
    const userInfo = this.data.userInfo;
    const formValues = this.data.formValues;

    if (!userInfo) {
      toast({
        icon: "error",
        title: "请先登录",
      });
    }

    const whitelist = {
      "school_info.name": {
        regex: /^.{1,10}$/,
        title: "姓名",
        isRequired: true,
        exists: () => {
          return userInfo.ext.school_info.name;
        },
      },
      "school_info.area": {
        regex: /^朝晖|屏峰|莫干山$/,
        title: "校区",
        isRequired: true,
        exists: () => {
          return userInfo.ext.school_info.area;
        },
      },
      "school_info.grade": {
        regex: /^\d{4}$/,
        title: "入学年份",
        isRequired: true,
        exists: () => {
          return userInfo.ext.school_info.grade;
        },
      },
      "school_info.graduate_grade": {
        regex: /^\d{4}$/,
        title: "毕业年份",
        isRequired: true,
        exists: () => {
          return userInfo.ext.school_info.graduate_grade;
        },
      },
    };
    // 验证是否填写
    for (const key in whitelist) {
      if (whitelist[key].isRequired) {
        if (!formValues[key] && !whitelist[key].exists()) {
          wx.showModal({
            title: `提示`,
            content: `请输入${whitelist[key]["title"]}`,
            showCancel: false,
            confirmText: "我知道了",
          });
          return;
        }
      }
    }
    // 验证有效性
    for (const key in formValues) {
      if (whitelist[key] && whitelist[key].regex) {
        if (
          formValues[key] &&
          !String(formValues[key]).match(whitelist[key].regex)
        ) {
          wx.showModal({
            title: `提示`,
            content: `${whitelist[key]["title"]}不合法，请重新输入`,
            showCancel: false,
            confirmText: "我知道了",
          });
          return;
        }
      }
    }
    const validateGrade = () => {
      // 验证年份
      const grade = parseInt(
        formValues["school_info.grade"] || userInfo.ext.school_info.grade,
        10
      );
      const graduateGrade = parseInt(
        formValues["school_info.graduate_grade"] ||
          userInfo.ext.school_info.graduate_grade,
        10
      );

      if (grade && graduateGrade) {
        return graduateGrade >= grade;
      } else {
        return true;
      }
    };

    if (!validateGrade()) {
      wx.showModal({
        title: "提示",
        content: "毕业年份不能早于入学年份",
        showCancel: false,
        confirmText: "我知道了",
      });
      return;
    }

    const doSubmit = () => {
      // 提交
      app.services.updateUserInfo(
        () => {
          toast({
            title: "保存成功",
          });
          wx.disableAlertBeforeUnload({ fail: () => {} });
          this.setPageState({ formValues: {} });
        },
        {
          data: {
            ...formValues,
            ext_version: 1,
          },
        }
      );
    };
    // 提示姓名不能修改
    if (formValues["school_info.name"]) {
      wx.showModal({
        title: "提示",
        content: "姓名设置后不可修改，确认要提交吗？",
        success(res) {
          if (res.confirm) {
            doSubmit();
          }
        },
      });
      return;
    } else {
      doSubmit();
    }
  },
  showNotEditableHint(event) {
    if (!this.data.userInfo) {
      return;
    }

    const { key } = event.currentTarget.dataset;

    let title = null;
    if (key === "uno") {
      title = "学号";
    } else if (key === "name") {
      title = "姓名";
      if (!this.data.userInfo.ext.school_info.name) {
        return;
      }
    } else {
      title = "该信息";
    }
    wx.showModal({
      title: `提示`,
      content: `${title}不可修改，若有误，请联系客服`,
      showCancel: false,
      confirmText: "我知道了",
    });
  },
});
