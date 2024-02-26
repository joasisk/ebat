import axios from 'axios';

export default {
  approveAccess: accessData => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/access/approve`, accessData)
      .then(r => r);
  },
  addAccess: accessData => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/access/request`, accessData)
      .then(r => r);
  },
  revokeAccess: accessData => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/access/revoke`, accessData)
      .then(r => r);
  },
  updateAccess: accessData => {
    return axios
      .post(
        `${process.env.VUE_APP_BASE_API_URL}/access/update/request`,
        accessData
      )
      .then(r => r);
  },
  getAllAccessRequest() {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/access/fetch/all/request/`)
      .then(r => r);
  }
};
