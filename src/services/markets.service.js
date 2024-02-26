import axios from 'axios';

export default {
  getAllMarkets() {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/market/get/all`)
      .then(r => r);
  },
  addMarket: marketData => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/market/add`, marketData)
      .then(r => r);
  },
  removeMarket: marketId => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/market/remove/${marketId}`)
      .then(r => r);
  }
};
