const state = {
  connected: false,
  requests: []
};
const actions = {
  updateBatchProgress({ commit }, data) {
    commit('updateBatchProgress', data);
  },
  removeRQ({ commit }, id) {
    commit('removeRQ', id);
  }
};
const mutations = {
  updateBatchProgress(state, data) {
    const item = state.requests.find(
      e => e.id === data.id && e.filename === data.filename
    );
    if (item) {
      state.requests.splice(
        state.requests.findIndex(
          value => value.id === item.id && value.filename === item.filename
        ),
        1,
        { ...item, ...data }
      );
    } else {
      state.requests.push(data);
    }
  },
  removeRQ(state, item) {
    state.requests.splice(
      state.requests.findIndex(
        value => value.id === item.id && value.filename === item.filename
      ),
      1
    );
  },
  wipeOnLogout(state) {
    state.requests = [];
  },
  // allowToConnect(state) { todo
  //   state.allowedToConnect = true;
  // },
  updateConnected(state, value) {
    state.connected = value;
  }
};

export const sockets = {
  namespaced: true,
  state,
  mutations,
  actions
};
