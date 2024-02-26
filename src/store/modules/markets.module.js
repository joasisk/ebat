// eslint-disable-next-line no-unused-vars
import marketService from '@/services/markets.service';

const state = {
  loading: false,
  markets: []
};
const actions = {
  /**
   * Action to get all the markets
   * @param {object} context - Vuex store context
   */
  getAllMarkets({ commit }) {
    commit('setMarkets', []);
    commit('setLoadingState', true);
    marketService
      .getAllMarkets()
      .then(r => commit('setMarkets', r))
      .finally(() => commit('setLoadingState', false));
  },
  /**
   * Action to add market
   * @param {object} context - Vuex store context
   * @param {object} market - Market object to add
   */
  addMarket({ commit, dispatch }, market) {
    commit('setLoadingState', true);
    marketService
      .addMarket(market)
      .then(() => dispatch('getAllMarkets'))
      .finally(() => commit('setLoadingState', false));
  },
  /**
   * Action to remove market
   * @param {object} context - Vuex store context
   * @param {number} marketId - ID of market to be deleted
   */
  removeMarket({ commit, dispatch }, marketId) {
    commit('setLoadingState', true);
    marketService
      .removeMarket(marketId)
      .then(() => dispatch('getAllMarkets'))
      .finally(() => commit('setLoadingState', false));
  }
};
const mutations = {
  setLoadingState(state, loading) {
    state.loading = loading;
  },
  /**
   * Mutation to change current store markets
   * @param {object} state - Vuex store state
   * @param {array} markets - Array of markets
   */
  setMarkets(state, markets) {
    state.markets = markets;
  }
};

export const markets = {
  namespaced: true,
  state,
  actions,
  mutations
};
