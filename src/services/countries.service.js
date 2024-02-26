import axios from 'axios';

export default {
  getAllCountries() {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/country/get/all`)
      .then(r => r);
  },
  addCountry: countryData => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/country/add`, countryData)
      .then(r => r);
  },
  removeCountry: countryId => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/country/remove/${countryId}`)
      .then(r => r);
  }
};
