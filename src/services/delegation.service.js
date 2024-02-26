import axios from 'axios';

export default {
  addDelegate(data) {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/link/user/delegate/add`, data)
      .then(r => r);
  },
  deleteDelegateToMe(data) {
    if (data.successor == '')
      return axios
        .delete(
          `${process.env.VUE_APP_BASE_API_URL}/link/user/delegate/revoke/delegation/${data.email}/{emailB}/${data.startDate}/${data.endDate}`
        )
        .then(r => r);
    return axios
      .delete(
        `${process.env.VUE_APP_BASE_API_URL}/link/user/delegate/revoke/delegation/${data.email}/${data.successor}/${data.startDate}/${data.endDate}`
      )
      .then(r => r);
  },
  deleteDelegateByMe(data) {
    return axios
      .delete(
        `${process.env.VUE_APP_BASE_API_URL}/link/user/delegate/delete/assigned/${data.deleteId}/${data.startDate}/${data.endDate}`
      )
      .then(r => r);
  },

  getDelegatedByMe() {
    return axios
      .get(
        `${process.env.VUE_APP_BASE_API_URL}/link/user/delegate/view/delegates`
      )
      .then(r => r);
  },

  getDelegatedToMe() {
    return axios
      .get(
        `${process.env.VUE_APP_BASE_API_URL}/link/user/delegate/view/delegator`
      )
      .then(r => r);
  },
  getAllPossibleDelegates: userId => {
    return axios
      .get(
        `${process.env.VUE_APP_BASE_API_URL}/link/user/delegate/view/unassigned/${userId}`
      )
      .then(r => r);
  }
};
