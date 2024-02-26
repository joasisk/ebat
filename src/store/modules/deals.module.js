import router from '@/router/index';
import dealsService from '@/services/deals.service';

import Vue from 'vue';

const state = {
  loading: false,
  loading2: false,
  loadingSearchData: false,
  bookmark: '',
  deal: {},
  deal2: {},
  deals: [],
  lastFetch: 0,
  batchFile: null,
  file: null,
  aiIndex: null,
  downloadStarted: [],
  searchData: []
};

const FILE_CHUNK_SIZE = 1024 * 1024 * 5;

const actions = {
  annuityApprove({ dispatch, commit }) {
    commit('setLoading', true);
    dealsService
      .annuityApprove(state.deal._id)
      .then(() => dispatch('getDeal', state.deal._id))
      .finally(() => commit('setLoading', false));
  },
  annuityReturn({ dispatch, commit }) {
    commit('setLoading', true);
    dealsService
      .annuityReturn(state.deal._id)
      .then(() => dispatch('getDeal', state.deal._id))
      .finally(() => commit('setLoading', false));
  },
  requestAnnuity({ dispatch, commit }) {
    commit('setLoading', true);
    dealsService
      .requestAnnuity({ id: state.deal._id, deal: state.deal })
      .then(() => dispatch('getDeal', state.deal._id))
      .finally(() => commit('setLoading', false));
  },
  assignAnnuity({ dispatch, commit }) {
    commit('setLoading', true);
    dealsService
      .assignAnnuity(state.deal._id)
      .then(() => dispatch('getDeal', state.deal._id))
      .finally(() => commit('setLoading', false));
  },
  withdraw({ dispatch, commit }) {
    commit('setLoading', true);
    dealsService
      .withdraw({
        id: state.deal._id
      })
      .then(() => dispatch('getDeal', state.deal._id))
      .finally(() => commit('setLoading', false));
  },
  repairBid({ commit }) {
    commit('setLoading', true);
    dealsService
      .bidRepair({
        id: state.deal._id
      })
      .then(() => router.push('/'))
      .finally(() => commit('setLoading', false));
  },
  saveChanges({ dispatch, commit }) {
    commit('setLoading', true);
    dealsService
      .saveChanges({
        actionItem: state.deal.actionItem,
        document: state.deal.document,
        id: state.deal._id
      })
      .then(() => dispatch('getDeal', state.deal._id))
      .finally(() => commit('setLoading', false));
  },

  async saveChangesAsync({ dispatch, commit }) {
    return new Promise((resolve, reject) => {
      commit('setLoading', true);
      dealsService
        .saveChanges({
          actionItem: state.deal.actionItem,
          document: state.deal.document,
          id: state.deal._id
        })
        .then(() => {
          dispatch('getDeal', state.deal._id);
          resolve();
        })
        .catch(() => reject())
        .finally(() => commit('setLoading', false));
    });
  },

  // eslint-disable-next-line no-unused-vars
  resolveReview({ dispatch, commit }, { section, index, user }) {
    dealsService
      .resolveReview({ id: state.deal._id, section, index })
      .then(() => dispatch('getDeal', state.deal._id));
  },

  resolve({ commit }, type) {
    commit('setLoading', true);
    dealsService
      .resolve({ type, id: state.deal._id })
      .then(() => {
        commit('setLoading', false);
        router.push('/');
      })
      .finally(() => commit('setLoading', false));
  },

  setAiIndex({ commit }, index) {
    commit('setAiIndex', index);
  },

  addReviewer({ commit }, { reviewer, section, index }) {
    dealsService
      .addReviewer({ id: state.deal._id, reviewer, section, index })
      .then(r => {
        commit('addReviewer', { reviewer, section, index });
        commit('setDeal', r);
      });
  },

  downloadFile({ commit }, data) {
    commit('setDownloading', {
      index: data.index,
      fileIndex: data.fileIndex,
      value: true
    });
    dealsService
      .downloadFile(data)
      .then(() => {
        commit('setDownloading', {
          index: data.index,
          fileIndex: data.fileIndex,
          value: false
        });
      })
      .catch(() =>
        commit('setDownloading', {
          index: data.index,
          fileIndex: data.fileIndex,
          value: false
        })
      );
  },

  resetBookmark({ commit }) {
    commit('setBookmark', '');
  },

  getDealsPage({ commit }, data) {
    commit('setLoading', true);
    dealsService
      .getDealsPage(data)
      .then(r => {
        commit('setDealsPage', r.docs);
        commit('setLastFetch', r.docs.length);
        commit('setBookmark', r.bookmark);
      })
      .catch(() => commit('setLastFetch', 0))
      .finally(() => commit('setLoading', false));
  },
  resetDeals({ commit }) {
    commit('setDeals', []);
  },

  getDeals({ commit }) {
    commit('setLoading', true);
    dealsService
      .getDeals()
      .then(r => {
        commit('setDeals', r);
      })
      .finally(() => commit('setLoading', false));
  },

  getDeal({ commit }, id) {
    commit('setLoading', true);
    dealsService
      .getDeal(id)
      .then(r => {
        commit('setDeal', r);
      })
      .finally(() => commit('setLoading', false));
  },

  getDeal2({ commit }, id) {
    commit('setLoading2', true);
    dealsService
      .getDeal(id)
      .then(r => {
        commit('setDeal2', r);
      })
      .finally(() => commit('setLoading2', false));
  },

  getDMSSData({ commit }, id) {
    commit('setLoading', true);
    dealsService
      .getDeal(id)
      .then(r => {
        commit('combineDealData', r);
      })
      .finally(() => commit('setLoading', false));
  },

  async setDealStructure({ commit }, data) {
    return Promise.resolve(commit('setDealStructure', data));
  },

  submit({ commit }) {
    commit('setLoading', true);
    dealsService.submit(state.deal).catch(() => {});
  },

  update({ commit, dispatch }) {
    commit('setLoading', true);
    dealsService
      .update(state.deal)
      .then(() => dispatch('getDeal', state.deal._id))
      .finally(() => commit('setLoading', false));
  },

  async updateAsync({ commit }) {
    return new Promise((resolve, reject) => {
      commit('setLoading', true);
      dealsService
        .update(state.deal)
        .then(() => resolve())
        .catch(() => reject())
        .finally(() => commit('setLoading', false));
    });
  },

  draft({ commit, dispatch }, deal) {
    commit('setLoading', true);
    dealsService
      .createDraft(deal)
      .then(r => dispatch('getDeal', r.id))
      .finally(() => commit('setLoading', false));
  },
  /**
   * assigns self as deal approver
   */
  assign({ commit, dispatch }, id) {
    commit('setLoading', true);
    dealsService
      .assign(id)
      .then(() => dispatch('getDeal', id))
      .finally(() => commit('setLoading', false));
  },

  approve(
    { commit, dispatch },
    { id, approvalComment, approvalClauses, approvalFiles, socketid }
  ) {
    commit('setLoading', true);
    dealsService
      .approve({ id, approvalComment, approvalClauses })
      .then(() => {
        if (approvalFiles.length > 0 && typeof approvalFiles[0] !== 'string') {
          for (let file of approvalFiles) {
            if (file == null) return;
            if (typeof file.name !== 'string') return;

            const fd = new FormData();
            fd.append('file', file);

            dispatch('uploadFile', {
              reqid: id,
              socketid,
              fd,
              fileType: 'approvalFiles',
              filename: file.name
            });
          }
        }
        router.push('/');
      })
      .finally(() => commit('setLoading', false));
  },

  reject({ commit }, id) {
    commit('setLoading', true);
    dealsService
      .reject(id)
      .then(() => router.push('/'))
      .finally(() => commit('setLoading', false));
  },

  async uploadFile({ dispatch }, data) {
    const file = data.fd.get('file');
    // filename
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const filename = data.reqid + '__' + timestamp + '__' + file.name;

    // code for chunks from the tutorial
    const chunks = [];
    const finalPointer = file.size;
    let startPointer = 0;

    while (startPointer < finalPointer) {
      const newStartPointer = startPointer + FILE_CHUNK_SIZE;

      const slice = file.slice(startPointer, newStartPointer);
      chunks.push(slice);

      startPointer = newStartPointer;
    }

    // data array for getUrls
    let dataToSend = {
      socketId: data.socketid,
      reqId: data.reqid,
      filename: encodeURIComponent(filename),
      fileType: data.fileType,
      parts: chunks.length,
      index: data.index !== undefined ? `${data.index}` : undefined
    };

    let progress = 0;

    const batchData = {
      id: data.reqid,
      filename: data.filename,
      status: 'U',
      progress
    };
    //start WS notification
    await dispatch('sockets/updateBatchProgress', batchData, { root: true });

    // request for urls
    dealsService
      .getUrls(dataToSend)
      .then(async r => {
        const { uploadId, parts } = r;

        // send parts to cos
        const completeBody = {
          filename,
          filetype: data.fileType,
          socketId: data.socketid,
          uploadId,
          partsETags: [],
          index: data.index !== undefined ? `${data.index}` : undefined
        };
        try {
          //catch all etags
          await Promise.all(
            parts.map(async ({ url, part }) => {
              const index = part - 1;
              const resp = await dealsService.uploadPartToCOS(
                url,
                chunks[index]
              );
              completeBody.partsETags.push({
                PartNumber: part,
                ETag: resp.headers.etag
              });
              // Update notification of file section
              progress += 100 / parts.length;
              await dispatch(
                'sockets/updateBatchProgress',
                {
                  id: data.reqid,
                  filename: data.filename,
                  status: progress === 100 ? 'P' : 'U',
                  progress
                },
                {
                  root: true
                }
              );
            })
          );

          //sort etags
          completeBody.partsETags = completeBody.partsETags.sort(
            (a, b) => a.PartNumber - b.PartNumber
          );

          //send complete request to backend
          await dealsService.completeUpload(completeBody);
          //different update for DMSS / Section files
          if (data.index === undefined) {
            data.fileType == 'annuityAttachment'
              ? await dispatch('updateValueAnnuityAttachment', {
                  key: data.fileType,
                  value: filename
                })
              : await dispatch('updateValue', {
                  key: data.fileType,
                  value: [filename]
                });
          } else {
            await dispatch('updateSectionFile', {
              section: data.fileType,
              index: data.index,
              file: filename
            });
          }
        } catch (e) {
          //handle network error
          dispatch(
            'sockets/removeRQ',
            { id: batchData.id, filename: batchData.filename },
            { root: true }
          );
          if (data.index == null) {
            dispatch('updateValue', { key: data.fileType, value: [] });
          } else {
            dispatch('updateSectionFile', {
              section: data.fileType,
              index: data.index,
              file: []
            });
          }
        }
      })
      .catch(() => {
        dispatch(
          'sockets/removeRQ',
          { id: batchData.id, filename: batchData.filename },
          { root: true }
        );
        if (data.index == null) {
          dispatch('updateValue', { key: data.fileType, value: [] });
        } else {
          dispatch('updateSectionFile', {
            section: data.fileType,
            index: data.index,
            file: []
          });
        }
      });
  },
  // FIXME: remove if nothing happened to MARCH 23
  // exportExcel({ commit }, data) {
  //   commit('setFile', 'empty');
  //   dealsService.exportExcel(data).then(r => commit('setFile', r.data));
  // },
  cloneDeal({ commit, dispatch }) {
    commit('setLoading', true);
    dispatch(
      'notifications/createNotification',
      {
        title: 'Cloning the deal...',
        severity: 'info'
      },
      { root: true }
    );
    dealsService
      .cloneDeal(state.deal._id)
      .then(r => {
        router.push(`/request/${r}`);
      })
      .finally(() => commit('setLoading', false));
  },

  deleteDraft({ commit }, { id }) {
    commit('setLoading', true);
    dealsService
      .deleteDraft(id)
      .then(() => router.push('/'))
      .finally(() => commit('setLoading', false));
  },

  iterate({ commit }, { id }) {
    commit('setLoading', true);
    dealsService
      .iterate({ id })
      .then(r => router.push(`/request/${r}`))
      .finally(() => commit('setLoading', false));
  },
  deleteFile({ commit }, { key, fileName, fileType, reqId, value }) {
    return new Promise((resolve, reject) =>
      dealsService
        .deleteFile({ fileName, fileType, reqId })
        .then(() => {
          commit('updateValue', { key, value });
          resolve();
        })
        .catch(() => reject())
    );
  },

  deleteApprovalFile({ commit }, { index }) {
    dealsService
      .deleteFile({
        fileName: state.deal.approvalFiles[index],
        fileType: 'approvalFiles'
      })
      .then(() => commit('deleteApprovalFile', { index }));
  },

  deleteSectionFile({ fileName, section, reqId }) {
    dealsService.deleteFile({ fileName, fileType: section, reqId });
  },

  // #################################################
  setBatchFile({ commit }, file) {
    commit('setBatchFile', file);
  },

  resetDeal({ commit }) {
    commit('resetDeal');
  },

  setFile({ commit }, file) {
    commit('setFile', file);
  },

  clearProject({ commit, dispatch }, clearData) {
    commit('clearProject');
    dispatch('forms/clearProject', clearData, { root: true });
  },

  addComment({ commit }, { dealID, comment, user, role }) {
    return new Promise((resolve, reject) => {
      dealsService
        .addReview(dealID, comment)
        .then(() => {
          commit('addColComment', { comment, user, role });
          resolve();
        })
        .catch(() => reject());
    });
  },

  updateValue({ commit }, { key, value }) {
    commit('updateValue', { key, value });
  },
  updateValueAnnuityAttachment({ commit }, { key, value }) {
    commit('updateValueAnnuityAttachment', { key, value });
  },

  addSection({ commit }, { section, content }) {
    commit('addSection', { section, content });
  },

  updateSectionText({ commit }, { section, index, text }) {
    commit('updateSectionText', { section, index, text });
  },

  updateSectionFile({ commit }, { section, index, file }) {
    commit('updateSectionFile', { section, index, file });
  },

  updateSectionApproval(
    { commit },
    { id, section, index, approval, updateText }
  ) {
    dealsService
      .sectionApprove({ dealID: id, section, index, approval, updateText })
      .then(() =>
        commit('updateSectionApproval', { section, index, approval })
      );
  },

  addSectionComment(
    { commit },
    { section, index, comment, dealID, user, role }
  ) {
    dealsService
      .addSectionComment({ section, index, comment, dealID })
      .then(() =>
        commit('addSectionComment', { section, index, comment, user, role })
      );
  },
  prefetchSearch({ commit }) {
    commit('setLoadingSearchData', true);
    dealsService
      .prefetchSearch()
      .then(r => {
        commit('setSearchData', r);
      })
      .finally(() => commit('setLoadingSearchData', false));
  }
};

const mutations = {
  setBookmark(state, bookmark) {
    state.bookmark = bookmark;
  },
  setLastFetch(state, lastFetch) {
    state.lastFetch = lastFetch;
  },
  setDealsPage(state, newDeals) {
    state.deals = state.deals.concat(newDeals);
  },
  setDownloading(state, { index, value, fileIndex }) {
    let arr = state.downloadStarted[index];
    if (!arr) arr = [];
    arr[fileIndex] = value;
    Vue.set(state.downloadStarted, index, arr);
  },
  setLoading(state, loading) {
    state.loading = loading;
  },
  setLoading2(state, loading) {
    state.loading2 = loading;
  },
  setLoadingSearchData(state, loading) {
    state.loadingSearchData = loading;
  },
  setAiIndex(state, index) {
    state.aiIndex = index;
  },
  addReviewer(state, { section, reviewer, index }) {
    state.deal[section][index].reviews.push({
      email: reviewer.toLowerCase(),
      concluded: false
    });
  },
  resolveReview(state, { section, index, user }) {
    state.deal[section][index].reviews.find(
      r => r.email.toLowerCase() === user.toLowerCase()
    ).concluded = true;
  },
  setDeals(state, deals) {
    state.deals = deals;
  },
  setDealStructure(state, deal) {
    state.deal = deal;
  },
  setDeal(state, deal) {
    state.deal = deal;
  },
  setDeal2(state, deal) {
    state.deal2 = deal;
  },

  // Only the deal data from DMSS replace the data from state
  combineDealData(state, deal) {
    state.deal.geo = deal.geo;
    state.deal.customerName = deal.customerName;
    state.deal.opportunityNumber = deal.opportunityNumber;
    state.deal.typeOfContract = deal.typeOfContract;
    state.deal.contractStartDate = deal.contractStartDate;
    state.deal.contractEndDate = deal.contractEndDate;
    state.deal.duration = deal.duration;
    state.deal.tcvLocal = deal.tcvLocal;
    state.deal.periodRevUsd = deal.periodRevUsd;
    state.deal.dmssRequired = true;
    state.deal.dealSum = deal.dealSum;
  },
  resetDeal(state) {
    state.batchFile = null;
    state.deal = {};
  },
  setFile(state, file) {
    state.file = file;
  },
  updateValue(state, { key, value }) {
    if (key in state.deal) state.deal[key] = value;
    else Vue.set(state.deal, key, value);
  },
  updateValueAnnuityAttachment(state, { key, value }) {
    if (key in state.deal) {
      let tmp = state.deal[key];
      tmp.push(value);
      state.deal[key] = tmp;
    } else Vue.set(state.deal, key, value);
  },
  addSection(state, { section, content }) {
    if (!(section in state.deal)) Vue.set(state.deal, section, []);
    state.deal[section].push(content);
  },
  updateSectionText(state, { section, index, text }) {
    state.deal[section][index].text = text;
  },
  updateSectionFile(state, { section, index, file }) {
    if (section && section === 'termsAndConditions')
      state.deal[section][index].approved = '';
    if (Array.isArray(file)) state.deal[section][index].file = file;
    else {
      let tmp = state.deal[section][index].file;
      tmp.push(file);
      state.deal[section][index].file = tmp;
    }
  },
  updateSectionApproval(state, { section, index, approval }) {
    state.deal[section][index].approved =
      approval == 'reject' ? 'rejected' : 'approved';
  },
  addSectionComment(state, { section, index, comment, user, role }) {
    if (!state.deal[section]) Vue.set(state.deal, section, []);
    if (!state.deal[section][index])
      Vue.set(state.deal, section, { comments: [] });

    state.deal[section][index].comments.push({
      by: user,
      comment: comment,
      timestamp: new Date(),
      role: role
    });
  },
  addColComment(state, { comment, user, role }) {
    Object.keys(comment).forEach(key => {
      if (!state.deal[key]) {
        Vue.set(state.deal, key, { comments: [], reviews: [] });
      }
      state.deal[key].comments.push({
        by: user,
        review: comment[key],
        role: role,
        timestamp: new Date()
      });
    });
  },
  deleteApprovalFile(state, { index }) {
    state.deal.approvalFiles.splice(index, 1);
  },
  setSearchData(state, searchData) {
    state.searchData = searchData.reduce((result, attribute) => {
      if (attribute) {
        result.push({
          ...attribute,
          value: attribute.value.toString(),
          key: attribute.head + '*' + attribute.value.toString()
        });
        result.push({
          head: attribute.head,
          value: `!${attribute.value}`,
          key: attribute.head + '*' + `!${attribute.value}`,
          displayValue: `not ${attribute.displayValue}`
        });
      }
      return result;
    }, []);
  }
};

export const deals = {
  namespaced: true,
  state,
  actions,
  mutations
};
