import axios from 'axios';

export default {
  getAllUsers() {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/user/get/all/enabled`)
      .then(r => r);
  },
  disableUser: id => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/user/disable/${id}`)
      .then(r => r);
  },
  getReviewers(dealID) {
    return axios
      .get(
        `${process.env.VUE_APP_BASE_API_URL}/deal/get/reviewer/all/${dealID}`
      )
      .then(r => r);
  }
};
