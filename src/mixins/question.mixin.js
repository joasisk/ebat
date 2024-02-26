import valueGenerators from '@/helpers/valueGenerator.js';

export default {
  methods: {
    generateValueName(label) {
      return valueGenerators.generateValueName(label);
    },
    // VALIDATORS below

    /**
     * returns true if value is not empty
     * else returns error message
     *
     * @param {*} value value of an input
     * @returns true / error message
     */
    required(value, rule) {
      // if not required return no error
      if (!rule.required) return true;
      // if no condition to rule
      if (!rule.if)
        return value !== '' && value != null && value.length !== 0 // check for not empty value
          ? true
          : 'This field is required';
      // if condition present
      const expectedValues = rule.value.split(';').map(item => item.trim());
      const ifFieldValue =
        typeof this.$store.state.deals.deal[rule.field] == 'string'
          ? this.$store.state.deals.deal[rule.field].trim()
          : this.$store.state.deals.deal[rule.field];
      // check if value is in condition - if this field should be required
      if (expectedValues.some(v => v === ifFieldValue))
        return value !== '' && value != null && value.length !== 0 // check for not empty value
          ? true
          : 'This field is required';
    },

    /**
     * used on string inputs
     *
     * @param {String} value
     * @param {Object} rule
     * @returns true / error message
     */
    longerThan(value, rule = { tooShort: 0 }) {
      return value.length > rule.tooShort
        ? true
        : `This field must be of ${rule.tooShort + 1} characters or longer`;
    },

    /**
     * validate string for length under a value
     *
     * @param {String} value
     * @param {Object} rule
     * @returns true / error message
     */
    shorterThan(value, rule = { tooLong: 100 }) {
      return value.length < rule.tooLong
        ? true
        : `This field must be of ${rule.tooLong - 1} characters or shorter`;
    },

    /**
     * validates string for length in interval
     *
     * @param {String} value
     * @param {Object} rule
     * @returns true / error message
     */
    lengthInterval(value, rule = { tooShort: 0, tooLong: 100 }) {
      return value.length > rule.tooShort && value.length < rule.tooLong
        ? true
        : `This field must have value of length between ${rule.tooShort +
            1} and ${rule.tooLong - 1}`;
    },

    /**
     * checks if string is of exact length
     *
     * @param {String} value
     * @param {Object} rule
     * @returns true / error message
     */
    ofLength(value, rule) {
      return value.length === rule.perfection
        ? true
        : `This field must be ${rule.perfection} characters long`;
    },
    // @@@@@@@&#%#%%(/&@&%%&&%@@@@@@@@@@@&#%###(##@@@@@@@@@@@@@@@@@@@@@@&%&&&@@@@@@@@@@
    // @@@@@@@&#%#%%/@@@@@@@@@@@@@@@@@@@@@@@##((#(@@@@@@@@@@@@@@@@@@@@@&&%&&&@@@@@@@@@@
    // @@@@@@@&######@@@@@@@@@@@@&%%###(((@@@(((((@@@@@@@@@@@@@@@@@@@@@&&%%&&&@@@@@@@@@
    // @@@@@@@&##(##%@@@@@@@@@&#(((((/**///&@@((((@@@@@@@@@@@@@@@@@@@@@&&%%%&&@@@@@@@@@
    // @@@@@@@%(#(#(%@@@@@@@%%%((/////**/*//@%((##&@@@@@@@@@@@@@@@@@@@@&&%%%@@@@@@@@@@@
    // &&&&&@@%##(&&%#(####@&%%&@#/*,*%&&/**#*/#%%%%%%%%%%%&&&&&&&&&&&&&&%&&&&&&&&&&@@@
    // &&&&&&&%%%%%%%%%%%%%%@&%@#%@&///////*/(/######################%%%@%%%&&&&&&&&&&&
    // &&&&%&@%####%%%#%####&&%##%@#(//******((((###############%%%%%%%&@%%%%%&&&@@@@@@
    // &&&&&&@%####%@@@@@@@@@@@&%(#%%#((/****/(((#@@@@@@@@@@@@@@@@@@@@&&&%%%%%@@@@@@@@@
    // @@@@@@@%####%@@@@@@@@@@@@@(%@&%(*****/@@(((@@@@@@@@@@@@@@@@@@@@@&@%%%%%@@@@@@@@@
    // @@@@@@@&####(@@@@@@@@@@@@@@@&%#(***(@@@@(#(@@@@@@@@@@@@@@@@@@@@@&&%%%%%@@@@@@@@@
    // @@@@@@@&####(@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&&#%%%%@@@@@@@@@
    // @@@@@@@&##(#(@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&&#%%%%@@@@@@@@@
    // @@@@@@@&####(@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&&%%%%%@@@@@@@@@
    // @@@@@@@&####(@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&&%%%%%@@@@@@@@@
    // @@@@@@@&####@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&&%%%%%&@@@@@@@@
    // @@@@@@@&###@@@@@@@@@@@@@@@@@@@@@@@@@@@&@&@&@@@@@@&@@@@@@@@@@@@@@&&&%%%%@@@@@@@@@
    // @@@@@@@@%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&&%%#&&@@@@@@@@

    /**
     * compare value to too small value
     *
     * @param {Number} value
     * @param {Object} rule
     * @returns true / error message
     */
    greaterThan(value, rule) {
      return value > rule.tooLittle
        ? true
        : `Value must be greater than ${rule.tooLittle}.`;
    }
  }
};
