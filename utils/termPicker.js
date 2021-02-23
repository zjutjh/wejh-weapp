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

// function validateTerm(term) {
//   return /^\d{4}\/\d{4}\(\d\)/.test(term);
// }

module.exports = {
  getInfoFromTerm,
  // validateTerm,
};
