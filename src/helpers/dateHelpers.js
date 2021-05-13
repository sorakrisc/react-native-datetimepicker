const toBuddhistYear = (momentDate, format) => {
  let christianYear = momentDate.format('YYYY');
  let buddhistYear = (parseInt(christianYear) + 543).toString();
  return momentDate.format(format.replace('YYYY', buddhistYear).
      replace('YY', buddhistYear.substring(2, 4))).
      replace(christianYear, buddhistYear);
};

const daysInMonth = ({ month, year }) => { // m is 1 indexed: 1-12
    switch (month) {
        case 2 :
            return (year % 4 == 0 && year % 100) || year % 400 == 0 ? 29 : 28;
        case 4 :
        case 6 :
        case 9 :
        case 11 :
            return 30;
        default :
            return 31;
    }
};

const isValid = ({ day, month, year }) => {
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    return month >= 1 && month < 13 && day > 0 && day <= daysInMonth({month: m, year: y});
};

export {toBuddhistYear, daysInMonth, isValid}
