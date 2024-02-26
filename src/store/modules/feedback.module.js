import feedbackService from '@/services/feedback.service';
import router from '@/router';

const state = {
  loading: false
};
const actions = {
  createReport({ commit }, description) {
    commit('setLoadingState', true);
    feedbackService
      .createReport(description)
      .then(() => router.push('/'))
      .finally(() => commit('setLoadingState', false));
  },
  createRequest({ commit }, description) {
    commit('setLoadingState', true);
    feedbackService
      .createRequest(description)
      .then(() => router.push('/'))
      .finally(() => commit('setLoadingState', false));
  }
};
const mutations = {
  setLoadingState(state, loading) {
    state.loading = loading;
  }
};

export const feedback = {
  namespaced: true,
  state,
  actions,
  mutations
};
