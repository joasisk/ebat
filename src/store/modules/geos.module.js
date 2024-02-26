import geoService from '@/services/geos.service';

const state = {
  loading: false,
  geos: []
};
const actions = {
  /**
   * Action to get all the geos
   * @param {object} context - Vuex store context
   */
  getAllGeos({ commit }) {
    commit('setGeos', []);
    commit('setLoadingState', true);
    geoService
      .getAllGeos()
      .then(r => commit('setGeos', r))
      .finally(() => commit('setLoadingState', false));
  },
  /**
   * Action to add geo
   * @param {object} context - Vuex store context
   * @param {object} geo - Geo object to add
   */
  addGeo({ commit, dispatch }, geo) {
    commit('setLoadingState', true);
    geoService
      .addGeo(geo)
      .then(() => dispatch('getAllGeos'))
      .finally(() => commit('setLoadingState', false));
  },
  editGeo({ commit, dispatch }, geo) {
    commit('setLoadingState', true);
    geoService
      .editGeo(geo)
      .then(() => dispatch('getAllGeos'))
      .finally(() => commit('setLoadingState', false));
  },
  /**
   * Action to remove geo
   * @param {object} context - Vuex store context
   * @param {number} geoId - ID of geo to be deleted
   */
  removeGeo({ commit, dispatch }, geoId) {
    commit('setLoadingState', true);
    geoService
      .removeGeo(geoId)
      .then(() => dispatch('getAllGeos'))
      .finally(() => commit('setLoadingState', false));
  }
};
const mutations = {
  setLoadingState(state, loading) {
    state.loading = loading;
  },
  /**
   * Mutation to change current store countries
   * @param {object} state - Vuex store state
   * @param {array} geos - Array of geos
   */
  setGeos(state, geos) {
    state.geos = geos;
  }
};

export const geos = {
  namespaced: true,
  state,
  actions,
  mutations
};
