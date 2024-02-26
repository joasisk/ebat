export default {
  displayAnnouncementDate(announcementDate) {
    let date = new Date(announcementDate);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour12: true,
      hour: '2-digit'
    });
  },
  handleDateRange(range) {
    if (range[0] > range[1]) return [range[1], range[0]];
    return range;
  },
  combineDateAndHour(date, time) {
    let combinedDate = new Date(date);
    combinedDate.setHours(time.number);
    return combinedDate.toISOString();
  },
  adaptDateRangeForEdit(start, end) {
    let newRange = {};

    let formattedStart = new Date(start);
    let formattedEnd = new Date(end);
    newRange.date = [
      new Date(
        formattedStart.getTime() - formattedStart.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0],
      new Date(
        formattedEnd.getTime() - formattedEnd.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]
    ];

    newRange.startTime = this.adaptTimeForEdit(formattedStart.getHours());
    newRange.endTime = this.adaptTimeForEdit(formattedEnd.getHours());

    return newRange;
  },
  adaptTimeForEdit(originalTime) {
    return { number: originalTime, value: originalTime + ':00' };
  }
};
