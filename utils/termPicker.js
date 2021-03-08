const semesters = ["上", "下", "短"];

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

function getTermStrForDisplay(termInfo) {
  termInfo = termInfo || {};
  let parsedYear = parseInt(termInfo.year, 10);
  parsedYear = parsedYear ? `${parsedYear}/${parsedYear + 1}` : "未知学年";
  const parsedSemester = semesters[termInfo.semester - 1] || "未知学期";
  return `${parsedYear}(${parsedSemester})`;
}

// function validateTerm(term) {
//   return /^\d{4}\/\d{4}\(\d\)/.test(term);
// }

module.exports = {
  semesters,
  getInfoFromTerm,
  getTermStrForDisplay,
  // validateTerm,
};
