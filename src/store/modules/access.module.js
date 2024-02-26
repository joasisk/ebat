import router from '@/router/index';
import accessService from '@/services/access.service';
import { auth_service } from '@/services/auth.service';

const state = {
  loading: false,
  submitted: false,
  pendingAccesses: []
};
const actions = {
  getAllAccessRequest({ commit }) {
    commit('setLoadingState', true);
    accessService
      .getAllAccessRequest()
      .then(r => commit('setPendingAccesses', r))
      .catch(() => commit('setPendingAccesses', []))
      .finally(() => commit('setLoadingState', false));
  },

  approveAccess({ commit, dispatch }, data) {
    commit('setLoadingState', true);
    accessService
      .approveAccess(data)
      .then(() => {
        dispatch('users/getAllUsers', null, { root: true });
        dispatch('getAllAccessRequest');
      })
      .finally(() => commit('setLoadingState', false));
  },
  addAccess({ commit }, access) {
    commit('setLoadingState', true);
    accessService
      .addAccess(access.data)
      .then(() => commit('setRequestState', true))
      .catch(() => commit('setRequestState', false))
      .finally(() => commit('setLoadingState', false));
  },

  updateAccess({ commit }, access) {
    commit('setLoadingState', true);
    accessService
      .updateAccess(access)
      .finally(() => commit('setLoadingState', false));
  },
  revokeAccess({ commit }, data) {
    commit('setLoadingState', true);
    return accessService
      .revokeAccess(data)
      .then(() => {
        auth_service.logout(this);
        router.push('/logout');
      })
      .finally(() => commit('setLoadingState', false));
  }
};
const mutations = {
  setPendingAccesses(state, pendingAccesses) {
    // check if pendingAccesses is undefined
    if (pendingAccesses) state.pendingAccesses = pendingAccesses;
  },
  setLoadingState(state, loading) {
    state.loading = loading;
  },
  setRequestState(state, loading) {
    state.requestState = loading;
  }
};

export const accesses = {
  namespaced: true,
  state,
  actions,
  mutations
};
