import axios from 'axios';

export default {
  getAllGeos() {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/geo/get/all`)
      .then(r => r);
  },
  addGeo: geoData => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/geo/add`, geoData)
      .then(r => r);
  },
  editGeo: geo => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/geo/update`, geo)
      .then(r => r);
  },
  removeGeo: geoId => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/geo/remove/${geoId}`)
      .then(r => r);
  }
};
