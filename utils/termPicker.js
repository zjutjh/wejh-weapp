import dayjs from "../libs/dayjs/dayjs.min.js";

// 为学期选择器生成数据
function generateTermPickerData(grade, currentTerm) {
  const termRegex = /^(\d{4})\/(\d{4})\((\d)\)/;
  const matches = currentTerm && currentTerm.match(termRegex);

  let termEnd = dayjs().get("year");
  let currentSemester = 0;

  if (matches && matches.length === 4) {
    // 输入的学期有效时，termEnd 为当前 term + 1
    const parsedTerm = parseInt(matches[0], 10);
    if (parsedTerm) {
      termEnd = parsedTerm;
    }
    const parsedSemester = parseInt(matches[2], 10);
    if (parsedSemester && parsedSemester <= 3) {
      currentSemester = parsedSemester - 1;
    }
  }

  termEnd = termEnd + 1;

  // 若输入的年级有效则使用，不然，生成当前时间往前推六个学年的数据
  let termBegin = grade && grade <= termEnd ? grade : termEnd - 6;
  // 起始学年不早于 2013
  termBegin = termBegin >= 2013 ? termBegin : 2013;

  let termArr = [];
  // 遍历生成学年列表
  for (let i = termBegin; i <= termEnd; i++) {
    termArr.push(`${i}/${i + 1}`);
  }

  return {
    range: [termArr.reverse(), ["上", "下", "短"]],
    // 默认选中第二个学年（当前学期）
    value: [1, currentSemester],
  };
}

function generateTermStr(year, semester) {
  const parsedYear = parseInt(year, 10);
  const parsedSemester = semester || "未知学期";
  if (parsedYear) {
    return `${parsedYear}/${parsedYear + 1}(${parsedSemester})`;
  } else {
    return `未知学年(${parsedSemester})`;
  }
}

function validateTerm(term) {
  return /^\d{4}\/\d{4}\(\d\)/.test(term);
}

module.exports = {
  generateTermPickerData,
  generateTermStr,
  validateTerm,
};
