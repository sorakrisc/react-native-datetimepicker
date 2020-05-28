const toBuddhistYear = (momentDate, format) => {
  let christianYear = momentDate.format('YYYY');
  let buddhistYear = (parseInt(christianYear) + 543).toString();
  return momentDate.format(format.replace('YYYY', buddhistYear).
      replace('YY', buddhistYear.substring(2, 4))).
      replace(christianYear, buddhistYear);
};

export {toBuddhistYear}
