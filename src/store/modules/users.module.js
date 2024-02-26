import usersService from '@/services/users.service';

const state = {
  loading: false,
  users: [],
  reviewers: []
};
const actions = {
  getReviewers({ commit }, dealID) {
    commit('setLoadingState', true);
    usersService
      .getReviewers(dealID)
      .then(r => commit('setReviewers', r))
      .finally(() => commit('setLoadingState', false));
  },
  getAllUsers({ commit }) {
    commit('setUsers', []);
    commit('setLoadingState', true);
    usersService
      .getAllUsers()
      .then(r => commit('setUsers', r))
      .finally(() => commit('setLoadingState', false));
  },
  disableUser({ commit, dispatch }, id) {
    commit('setLoadingState', true);
    usersService
      .disableUser(id)
      .then(() => dispatch('getAllUsers'))
      .finally(() => commit('setLoadingState', false));
  }
};
const mutations = {
  setLoadingState(state, loading) {
    state.loading = loading;
  },
  setUsers(state, users) {
    state.users = users;
  },
  setReviewers(state, reviewers) {
    state.reviewers = reviewers;
  }
};

export const users = {
  namespaced: true,
  state,
  actions,
  mutations
};
