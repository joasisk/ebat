import axios from 'axios';

export default {
  createReport: description => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/report/bug`, description)
      .then(r => r);
  },
  createRequest: description => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/report/feature`, description)
      .then(r => r);
  }
};
