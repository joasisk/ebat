import delegationService from '@/services/delegation.service';

const state = {
  delegateCandidates: [],
  delegatedByMe: [],
  delegatedToMe: [],
  loadingAdding: false,
  loadingDelegatedByMe: false,
  loadingDelegatedToMe: false,
  loadingCandidates: false
};
const actions = {
  setLoading({ commit }, s) {
    commit('setLoading', s);
  },
  addDelegate({ commit, dispatch }, data) {
    commit('setLoading', true);
    commit('setLoadingDelegatedByMe', true);
    delegationService
      .addDelegate(data.data)
      .then(() => {
        dispatch('getDelegatedByMe', data.userId);
        dispatch('getPossibleDelegates', data.userId);
      })
      .finally(() => {
        commit('setLoading', false);
        commit('setLoadingDelegatedByMe', false);
      });
  },
  deleteDelegateToMe({ commit, dispatch }, data) {
    commit('setLoadingDelegatedToMe', true);
    delegationService
      .deleteDelegateToMe(data)
      .then(() => dispatch('getDelegatedToMe', data.userId))
      .finally(() => commit('setLoadingDelegatedToMe', false));
  },
  deleteDelegateByMe({ commit, dispatch }, data) {
    commit('setLoadingDelegatedByMe', true);
    commit('setDelegatedByMe', []);
    delegationService
      .deleteDelegateByMe(data)
      .then(() => dispatch('getDelegatedByMe', data.userId))
      .finally(() => commit('setLoadingDelegatedByMe', false));
  },
  getDelegatedByMe({ commit }, userId) {
    commit('setLoadingDelegatedByMe', true);
    commit('setDelegatedByMe', []);
    delegationService
      .getDelegatedByMe(userId)
      .then(res => commit('setDelegatedByMe', res.delegates))
      .finally(() => commit('setLoadingDelegatedByMe', false));
  },
  getDelegatedToMe({ commit, rootState }, userId) {
    if (rootState.user.role === 'Annuity') return;
    commit('setLoadingDelegatedToMe', true);
    commit('setDelegatedToMe', []);
    delegationService
      .getDelegatedToMe(userId)
      .then(res => commit('setDelegatedToMe', res.delegators))
      .finally(() => commit('setLoadingDelegatedToMe', false));
  },
  getPossibleDelegates({ commit }, data) {
    commit('setLoadingCandidates', true);
    commit('setPossibleDelegates', []);
    delegationService
      .getAllPossibleDelegates(data)
      .then(res => commit('setPossibleDelegates', res))
      .finally(() => commit('setLoadingCandidates', false));
  }
};
const mutations = {
  setLoading(state, s) {
    state.loadingAdding = s;
  },
  setLoadingDelegatedByMe(state, s) {
    state.loadingDelegatedByMe = s;
  },
  setLoadingDelegatedToMe(state, s) {
    state.loadingDelegatedToMe = s;
  },
  setLoadingCandidates(state, s) {
    state.loadingCandidates = s;
  },
  setDelegatedByMe(state, data) {
    state.delegatedByMe = data;
  },
  setDelegatedToMe(state, data) {
    state.delegatedToMe = data;
  },
  setPossibleDelegates(state, data) {
    state.delegateCandidates = data;
  }
};
const getters = {
  getActiveMasterList(state) {
    const NOW = new Date();
    const NOW_TIME = NOW.getTime();
    return state.delegatedToMe.reduce((r, m) => {
      const END = new Date(m.endDate),
        START = new Date(m.startDate);
      if (NOW_TIME >= START.getTime() && NOW_TIME < END.getTime()) {
        r.push(m.primary_email.toLowerCase());
      }
      return r;
    }, []);
  }
};

export const delegation = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
