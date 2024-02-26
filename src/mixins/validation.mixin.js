export default {
  methods: {
    validateEmail(email) {
      // eslint-disable-next-line no-useless-escape
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }
  },
  validateDateRange(date) {
    return !(date && date.length === 2);
  },
  validateTimeString(time) {
    const format = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    return format.test(time);
  },
  validateLength(value, min, max) {
    return value.length < min || value.length > max;
  }
};
