import dayjs from "../../libs/dayjs/dayjs.min.js";
import { getTermStrForDisplay, semesters } from "../../utils/termPicker";

Component({
  properties: {
    allowsShortTerm: {
      type: Boolean,
      value: false,
    },
    currentData: {
      type: Object,
      value: {
        termInfo: null,
        extraValues: [],
      },
      observer: function (newVal, oldVal) {
        this._refreshPickerValue();
      },
    },
    pickerInfo: {
      type: Object,
      value: {
        termInfo: null,
        grade: null,
        extraRanges: [],
      },
      observer: function (newVal, oldVal) {
        this._refreshPickerRange();
      },
    },
  },
  data: {
    range: [["选择学年"], ["选择学期"]],
    value: [[0, 0]],
    currentTermStr: "",
  },
  lifetimes: {},
  methods: {
    // 为学期选择器生成 range 数据
    _refreshPickerRange() {
      if (!this.data.pickerInfo) {
        return;
      }

      const { termInfo, grade, extraRanges } = this.data.pickerInfo;

      let yearEnd = dayjs().get("year");

      if (termInfo) {
        const parsedTermYear = parseInt(termInfo.year, 10);
        if (parsedTermYear) {
          yearEnd = parsedTermYear;
        }
      }

      // 向前预留一年供选择
      yearEnd = yearEnd + 1;

      // 若输入的年级有效则用作年份限制，不然，生成当前时间往前推六个学年的数据
      let yearBegin = grade && grade <= yearEnd ? grade : yearEnd - 6;
      // 起始学年不早于 2013
      yearBegin = yearBegin >= 2013 ? yearBegin : 2013;

      let termArr = [];
      // 遍历生成学年列表
      for (let i = yearBegin; i <= yearEnd; i++) {
        termArr.push(`${i}/${i + 1}`);
      }

      const rangeSemesters = this.data.allowsShortTerm
        ? semesters
        : semesters.slice(0, 2);

      let range = [termArr.reverse(), rangeSemesters];
      if (Array.isArray(extraRanges)) {
        range = [...range, ...extraRanges];
      }

      this.setData({
        range,
      });

      this._refreshPickerValue();
    },
    // 更新选择器 value 数据，以及选中的学期提示
    _refreshPickerValue() {
      if (!this.data.currentData) {
        return;
      }

      const { termInfo, extraValues } = this.data.currentData;

      this.setData({
        currentTermStr: getTermStrForDisplay(termInfo),
      });

      if (this.data.range.length >= 2) {
        // 选择年份
        let termYearIndex = this.data.range[0].findIndex((year) =>
          year.startsWith(termInfo.year)
        );
        if (termYearIndex < 0) {
          termYearIndex = 0;
        }

        // 选择学期
        let semesterIndex = termInfo.semester - 1;
        if (semesterIndex >= this.data.range[1].length) {
          semesterIndex = 0;
        }

        // 选择额外数据
        let value = [termYearIndex, semesterIndex];
        if (Array.isArray(extraValues)) {
          value = [...value, ...extraValues];
        }

        this.setData({
          value,
        });
      } else {
        this.setData({
          value: [0, 0],
        });
      }
    },
    // 学期改变，e 为从 picker 传入的数据
    onPickerChange(e) {
      const { value } = e.detail;
      const range = this.data.range;
      if (range.length === 0 || value.length < 2) {
        return;
      }
      const termInfo = {
        year: this.data.range[0][value[0]].substring(0, 4),
        semester: value[1] + 1,
      };
      // 传出数据
      this.triggerEvent("termChange", {
        termInfo: termInfo,
        extraValues: value.slice(2),
      });
    },
  },
});
