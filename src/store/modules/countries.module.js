import countryService from '@/services/countries.service';

const state = {
  loading: false,
  countries: []
};
const actions = {
  /**
   * Action to get all the countries
   * @param {object} context - Vuex store context
   */
  getAllCountries({ commit }) {
    commit('setCountries', []);
    commit('setLoadingState', true);
    countryService
      .getAllCountries()
      .then(r => {
        commit('setCountries', r);
      })
      .finally(() => commit('setLoadingState', false));
  },
  /**
   * Action to add country
   * @param {object} context - Vuex store context
   * @param {object} country - Country object to add
   */
  addCountry({ commit, dispatch }, country) {
    commit('setLoadingState', true);
    countryService
      .addCountry(country)
      .then(() => dispatch('getAllCountries'))
      .finally(() => commit('setLoadingState', false));
  },
  /**
   * Action to remove country
   * @param {object} context - Vuex store context
   * @param {number} countryId - ID of country to be deleted
   */
  removeCountry({ commit, dispatch }, countryId) {
    commit('setLoadingState', true);
    countryService
      .removeCountry(countryId)
      .then(() => dispatch('getAllCountries'))
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
   * @param {array} countries - Array of countries
   */
  setCountries(state, countries) {
    state.countries = countries;
  }
};

export const countries = {
  namespaced: true,
  state,
  actions,
  mutations
};
