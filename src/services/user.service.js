import axios from 'axios';

export default {
  logout() {
    return axios.put(`${process.env.VUE_APP_AUTH_BASE_URL}/logout`);
  }
};
