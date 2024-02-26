import axios from 'axios';
import { fileProcessingService } from './file-processing.service';

export default {
  requestAnnuity: ({ id, deal }) =>
    axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/dealmaker/annuity/${id}`,
        deal
      )
      .then(r => r),
  assignAnnuity: id =>
    axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/annuity/assign?dealId=${id}`
      )
      .then(r => r),
  annuityApprove: id =>
    axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/annuity/approve?dealId=${id}`
      )
      .then(r => r),
  annuityReturn: id =>
    axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/annuity/return?dealId=${id}`
      )
      .then(r => r),
  cloneDeal: id =>
    axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/deal/clone/${id}`)
      .then(r => r),
  getDealsPage: data => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/deal/get`, data)
      .then(r => r);
  },
  getDeals: () => {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/deal/get/all`)
      .then(r => r);
  },
  getDeal: id => {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/deal/get/${id}`)
      .then(r => r);
  },

  saveChanges: ({ actionItem, document, id }) => {
    return axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/update/questionSection/${id}`,
        { document, actionItem }
      )
      .then(r => r);
  },

  resolveReview: ({ id, section, index }) => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/deal/review/resolve/${id}`, {
        section,
        index
      })
      .then(r => r);
  },

  // FIXME: remove if nothing happened to MARCH 23
  // exportExcel: data => {
  //   return axios
  //     .post(`${process.env.VUE_APP_BASE_API_URL}/files/export/excel`, data, {
  //       responseType: 'blob'
  //     })
  //     .then(r => r);
  // },

  deleteFile: ({ fileName, fileType, reqId }) => {
    let encodedFileName = encodeURIComponent(fileName);
    return axios
      .delete(
        `${process.env.VUE_APP_FILE_API_URL}/files/remove/${encodedFileName}?fileType=${fileType}&reqId=${reqId}`
      )
      .then(r => r);
  },

  // FIXME: NOT USED
  batchUpload: data => {
    if (data.index == null)
      return axios
        .post(
          `${process.env.VUE_APP_FILE_API_URL}/files/upload/?reqId=${data.reqid}&socketId=${data.socketid}&fileType=${data.fileType}`,
          data.fd
        )
        .then(r => r.data);
    return axios
      .post(
        `${process.env.VUE_APP_FILE_API_URL}/files/upload/?reqId=${data.reqid}&socketId=${data.socketid}&fileType=${data.fileType}&index=${data.index}`,
        data.fd
      )
      .then(r => r.data);
  },
  // FIXME: NOT USED
  uploadApprovalFiles: ({ id, approvalFiles, socketid }) => {
    const fd = new FormData();
    approvalFiles.forEach(file => {
      fd.append('file', file);
    });
    return axios.post(
      `${process.env.VUE_APP_FILE_API_URL}/files/upload/approval?socketId=${socketid}&reqId=${id}`,
      fd
    );
  },
  downloadFile(data) {
    return axios({
      url: `${process.env.VUE_APP_FILE_API_URL}/files/get/${data.filename}?dmss=${data.dmss}`,
      method: 'GET',
      responseType: 'blob'
    }).then(response => {
      if (!response) throw "File doesn't exists";
      let filename = decodeURIComponent(
        data.filename
          .split('__')
          .splice(2)
          .join('__')
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    });
  },
  addReviewer: ({ id, reviewer, section, index }) => {
    return axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/add/reviewer/${reviewer}/${id}`,
        { section, index }
      )
      .then(r => r);
  },
  resolve: ({ type, id }) => {
    return axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/resolve/${id}?status=${type}`
      )
      .then(r => r);
  },
  submit: deal => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/deal/submit/${deal._id}`, deal)
      .then(r => r);
  },
  update: data => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/deal/update/${data._id}`, data)
      .then(r => r);
  },
  createDraft: data => {
    return axios
      .post(`${process.env.VUE_APP_BASE_API_URL}/deal/add/draft`, data)
      .then(r => r);
  },
  deleteDraft: id => {
    return axios
      .delete(`${process.env.VUE_APP_BASE_API_URL}/deal/delete/draft/${id}`)
      .then(r => r);
  },
  addReview: (dealId, review) => {
    return axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/add/comment/${dealId}`,
        review
      )
      .then(r => {
        return r;
      });
  },
  assign: id => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/deal/approver/assign/${id}`)
      .then(r => r);
  },
  approve: ({ id, approvalComment, approvalClauses }) => {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/deal/approver/approve/${id}`, {
        approvalComment,
        approvalClauses
      })
      .then(r => r);
  },
  reject: id => {
    return axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/approver/return_dealmaker/${id}`
      )
      .then(r => r);
  },
  addSectionComment: ({ dealID, section, index, comment }) => {
    return axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/add/questionSection/comment/${dealID}`,
        {
          section,
          index,
          text: comment
        }
      )
      .then(r => r);
  },
  sectionApprove({ dealID, section, index, approval, updateText }) {
    return axios
      .put(
        `${process.env.VUE_APP_BASE_API_URL}/deal/approver/questionSection/${approval}/${dealID}`,
        { section, index, updateText }
      )
      .then(r => r);
  },
  iterate({ id }) {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/deal/iterate/${id}`)
      .then(r => r);
  },
  bidRepair({ id }) {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/deal/repair/${id}`)
      .then(r => r);
  },

  withdraw({ id }) {
    return axios
      .put(`${process.env.VUE_APP_BASE_API_URL}/deal/approver/withdraw/${id}`)
      .then(r => r);
  },
  getUrls(data) {
    return axios
      .post(
        `${process.env.VUE_APP_FILE_API_URL}/files/getUrls?socketId=${
          data.socketId
        }&reqId=${data.reqId}&filename=${encodeURIComponent(
          data.filename
        )}&fileType=${data.fileType}&index=${data.index}&parts=${data.parts}
        `
      )
      .then(r => r);
  },
  uploadPartToCOS(url, part) {
    return fileProcessingService.put(url, part, {}).then(r => r);
  },
  completeUpload(data) {
    data.filename = encodeURIComponent(data.filename);
    return axios
      .post(`${process.env.VUE_APP_FILE_API_URL}/files/uploadComplete`, data)
      .then(r => r);
  },
  prefetchSearch() {
    return axios
      .get(`${process.env.VUE_APP_BASE_API_URL}/deal/search/prefetch`)
      .then(r => r);
  }
};
