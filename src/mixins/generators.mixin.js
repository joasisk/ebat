import valueGenerators from '@/helpers/valueGenerator';
export default {
  data() {
    return {
      generators: [
        { value: 'randstr', text: 'Random string' },
        { value: 'userName', text: 'User name' },
        { value: 'userSurname', text: 'User surname' },
        { value: 'userFullname', text: 'User full name' },
        { value: 'userEmail', text: 'User email' },
        { value: 'userBPID', text: 'Lotus ID' },
        { value: 'today', text: 'Current Date' },
        { value: 'countryCode', text: 'Country Code' },
        { value: 'currentQuarterEnd', text: 'Current Quarter End' }
      ]
    };
  },
  methods: {
    randstr(config) {
      return valueGenerators.randstr(config);
    },
    // eslint-disable-next-line no-unused-vars
    userName(config) {
      return this.$store.state.user.name;
    },

    // eslint-disable-next-line no-unused-vars
    userEmail(config) {
      return this.$store.state.user.primary;
    },

    // eslint-disable-next-line no-unused-vars
    today(config) {
      return new Date().toISOString().split('T')[0];
    },

    // eslint-disable-next-line no-unused-vars
    countryCode(config, id) {
      if (id == null || id === '') return '';
      return this.$store.state.countries.countries.find(
        e => e.country_id === id
      ).country_code;
    },

    // eslint-disable-next-line no-unused-vars
    userBPID(config) {
      return this.$store.state.user.ibmserialnumber !== 'none'
        ? this.$store.state.user.ibmserialnumber
        : '';
    },

    sbliwValue(config) {
      return this.$store.state.signings.sbliwData[
        this.$store.state.signings.sbliwIndex
      ]
        ? this.$store.state.signings.sbliwData[
            this.$store.state.signings.sbliwIndex
          ][config.sbliwValue]
        : '';
    },

    currentQuarterEnd() {
      var now = new Date();
      var quarter = Math.floor(now.getMonth() / 3);
      var firstDate = new Date(now.getFullYear(), quarter * 3, 1);
      var endDate = new Date(
        firstDate.getFullYear(),
        firstDate.getMonth() + 3,
        0
      );
      return `${now.getFullYear()}-${endDate.getMonth() +
        1}-${endDate.getDate()}`;
    }
  }
};
