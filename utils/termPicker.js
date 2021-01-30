import dayjs from "../libs/dayjs/dayjs.min.js";

const semesterMap = ["上", "下", "短"];

// 为学期选择器生成数据
function getTermPickerData(grade, termInfo) {
  let yearEnd = dayjs().get("year");
  let currentSemester = 0;

  if (termInfo) {
    // 输入的学期有效时，termEnd 为当前 term + 1
    const parsedTermYear = parseInt(termInfo.year, 10);
    if (parsedTermYear) {
      yearEnd = parsedTermYear;
    }
    const parsedSemester = parseInt(termInfo.semester, 10);
    if (parsedSemester && parsedSemester <= 3) {
      currentSemester = parsedSemester - 1;
    }
  }

  yearEnd = yearEnd + 1;

  // 若输入的年级有效则使用，不然，生成当前时间往前推六个学年的数据
  let yearBegin = grade && grade <= yearEnd ? grade : yearEnd - 6;
  // 起始学年不早于 2013
  yearBegin = yearBegin >= 2013 ? yearBegin : 2013;

  let termArr = [];
  // 遍历生成学年列表
  for (let i = yearBegin; i <= yearEnd; i++) {
    termArr.push(`${i}/${i + 1}`);
  }

  return {
    range: [termArr.reverse(), semesterMap],
    // 默认选中第二个学年（当前学期）
    value: [1, currentSemester],
  };
}

function getPrettyTermStr(termInfo) {
  termInfo = termInfo || {};
  let parsedYear = parseInt(termInfo.year, 10);
  parsedYear = parsedYear ? `${parsedYear}/${parsedYear + 1}` : "未知学年";
  const parsedSemester = semesterMap[termInfo.semester - 1] || "未知学期";
  return `${parsedYear}(${parsedSemester})`;
}

function getInfoFromTerm(term) {
  const termRegex = /^(\d{4})\/(\d{4})\((\d)\)/;
  const matches = term && term.match(termRegex);
  if (matches.length === 4) {
    return {
      year: matches[1],
      semester: matches[3],
    };
  }
  return { year: null, semester: null };
}

function validateTerm(term) {
  return /^\d{4}\/\d{4}\(\d\)/.test(term);
}

module.exports = {
  getTermPickerData,
  getPrettyTermStr,
  validateTerm,
  getInfoFromTerm,
};
