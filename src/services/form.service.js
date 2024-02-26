import axios from 'axios';

export default {
  saveForm: form => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/form/update/latest`, form)
      .then(r => r);
  },
  getForm: () => {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/form/get/latest`)
      .then(r => r);
  },
  getFormById: id => {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/deal/form`, {
        params: { dealId: id }
      })
      .then(r => r);
  }
};
