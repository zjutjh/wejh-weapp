import dayjs from "../../libs/dayjs/dayjs.min.js";

const semesterMap = ["上", "下", "短"];

Component({
  properties: {
    range: {
      type: [String],
      value: [""],
    },
    value: {
      type: [Number],
      value: [],
    },
    isThree: {
      type: Boolean,
      value: false,
    },
    currentTerm: {
      type: String,
      value: "",
    },
  },
  data: {},
  lifetimes: {},
  methods: {
    //学期改变，e为从picker传入的数据
    onPickerChange(e) {
      const range = this.properties.range;
      const termInfo = {
        year: range[0][e.detail.value[0]].substring(0, 4),
        semester: e.detail.value[1] + 1,
      };

      //传出数据
      if (this.properties.isThree) {
        const thirdData = e.detail.value[2];
        this.triggerEvent("termChange", {
          termInfo: termInfo,
          thirdData: thirdData,
        });
      } else {
        this.triggerEvent("termChange", {
          termInfo: termInfo,
        });
      }
    },
  },
});
