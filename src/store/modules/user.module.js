import userService from '@/services/user.service';

const EMPTY_USER = {
  user_id: null,
  primary: '',
  secondary: '',
  name: '',
  surname: '',
  role: '',
  geo: {
    // TODO array
    name: '',
    id: null
  },
  markets: [],
  token: '',
  image: '',
  showLogoutWarning: false,
  loading: false,
  APIdown: false,
  sessionExpInterval: null,
  user_state: 0
};

const state = {
  user_id: null,
  primary: '',
  secondary: '',
  name: '',
  surname: '',
  role: '',
  geo: {
    // TODO array
    name: '',
    id: null
  },
  markets: [],
  token: '',
  image: '',
  showLogoutWarning: false,
  loading: false,
  APIdown: false,
  sessionExpInterval: null,
  user_state: 0
};
const actions = {
  storeUser({ commit }, user) {
    commit('setUser', user);
  },
  logout({ commit }) {
    userService
      .logout()
      .then(() => commit('setUser', { ...EMPTY_USER }))
      .catch(() => {
        commit('setUser', { ...EMPTY_USER });
      });
  },
  warn({ commit }, s) {
    commit('displayLogoutWarning', s);
  },
  setLoading({ commit }, s) {
    commit('setLoading', s);
  },
  setAPIflag({ commit }, status) {
    commit('setAPIflag', status);
  },
  setSessionExpInt({ commit }, interval) {
    commit('setSessionExpInt', interval);
  },
  clearLogoutInterval({ commit }) {
    commit('clearLogoutInterval');
  }
};
const mutations = {
  setUser(state, user) {
    Object.assign(state, user);
  },
  displayLogoutWarning(state, s) {
    state.showLogoutWarning = s;
  },
  setLoading(state, s) {
    state.loading = s;
  },
  setAPIflag(state, status) {
    state.APIdown = status;
  },
  setSessionExpInt(state, interval) {
    state.sessionExpInterval = interval;
  },
  clearLogoutInterval(state) {
    clearInterval(state.sessionExpInterval);
    state.sessionExpInterval = null;
  }
};
const getters = {
  getFullName(state) {
    return state.name + ' ' + state.surname;
  }
};

export const user = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
