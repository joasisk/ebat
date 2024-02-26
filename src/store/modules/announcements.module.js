import announcementService from '@/services/announcements.service';

const state = {
  announcements: [],
  announcementsToShow: [],
  loading: false
};
const actions = {
  getAllAnnouncements({ commit }) {
    commit('setAnnouncements', []);
    commit('setLoadingState', true);
    announcementService
      .getAnnouncements()
      .then(r => commit('setAnnouncements', r))
      .finally(() => commit('setLoadingState', false));
  },

  createAnnouncement({ commit, dispatch }, announcement) {
    commit('setLoadingState', true);
    announcementService
      .createAnnouncement(announcement)
      .then(() => dispatch('getAllAnnouncements'))
      .finally(() => commit('setLoadingState', false));
  },
  updateAnnouncement({ commit, dispatch }, announcement) {
    commit('setLoadingState', true);
    announcementService
      .updateAnnouncement(announcement)
      .then(() => dispatch('getAllAnnouncements'))
      .finally(() => commit('setLoadingState', false));
  },
  invalidateAnnouncement({ commit }, id) {
    commit('setLoadingState', true);
    announcementService
      .invalidateAnnouncement(id)
      .then(() =>
        commit(
          'setAnnouncements',
          announcements.state.announcements.filter(a => a.id !== id)
        )
      )
      .finally(() => commit('setLoadingState', false));
  },
  hide({ commit }, announcement) {
    commit('hideAnnouncement', announcement);
    // logic for not show again
    let doNotShowAgain = [];
    if (localStorage.getItem('doNotShowAgain')) {
      doNotShowAgain = JSON.parse(localStorage.getItem('doNotShowAgain'));
    }

    if (announcement.notShowAgain) {
      doNotShowAgain.push(announcement.id);
      localStorage.setItem('doNotShowAgain', JSON.stringify(doNotShowAgain));
    }
  },

  setAnnouncementsToShow({ commit }, announcements) {
    let doNotShowAgain = [];
    if (localStorage.getItem('doNotShowAgain')) {
      doNotShowAgain = JSON.parse(localStorage.getItem('doNotShowAgain'));
    }
    // update doNotShowAgain values to be updated
    doNotShowAgain.forEach(num => {
      if (!announcements.find(e => e.id === num)) {
        let doNotShowAgain = JSON.parse(localStorage.getItem('doNotShowAgain'));
        doNotShowAgain.splice(doNotShowAgain.indexOf(num), 1);
        localStorage.setItem('doNotShowAgain', JSON.stringify(doNotShowAgain));
      }
    });
    commit(
      'setAnnouncementsToShow',
      announcements.filter(a => !doNotShowAgain.includes(a.id))
    );
  }
};
const mutations = {
  setLoadingState(state, loading) {
    state.loading = loading;
  },
  setAnnouncements(state, announcements) {
    state.announcements = announcements;
  },
  hideAnnouncement(state, announcement) {
    state.announcementsToShow.splice(announcement.index, 1);
  },
  setAnnouncementsToShow(state, announcements) {
    state.announcementsToShow = announcements;
  }
};

export const announcements = {
  namespaced: true,
  state,
  actions,
  mutations
};
