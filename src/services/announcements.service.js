import axios from 'axios';

export default {
  getAnnouncements() {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/announcement`)
      .then(r => r);
  },
  createAnnouncement: data => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/announcement`, data)
      .then(r => r);
  },
  updateAnnouncement: data => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/announcement`, data)
      .then(r => r);
  },
  invalidateAnnouncement: id => {
    return axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/announcement/invalidate?id=${id}`
      )
      .then(r => r);
  }
};
