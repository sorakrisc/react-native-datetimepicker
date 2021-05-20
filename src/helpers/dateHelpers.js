import Moment from 'moment';

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
    const d = parseInt(day) || 1;
    const m = parseInt(month) || 1;
    const y = parseInt(year) || 1;
    return m >= 1 && m < 13 && d > 0 && d <= daysInMonth({month: m, year: y});
};

const isExceedMaxMinDate = ({date, maxDate, minDate}) => {
    if (date) {
        const { day, month, year } = date;
        const d = parseInt(day) || 1;
        const m = parseInt(month) || 1;
        const y = parseInt(year) || 1;
        const inputDate = Moment(`${y}/${m}/${d}`, 'YYYY/M/DD');
        return (Moment(maxDate) < inputDate)
            || (Moment(minDate) > inputDate);
    }
};

export {toBuddhistYear, daysInMonth, isValid, isExceedMaxMinDate}
