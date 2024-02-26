export default {
  data: () => ({
    access: {
      approval: -1,
      given_name: '',
      given_role: -1,
      is_disabled: true,
      last_name: '',
      pending_geo: -1, // TODO array
      pending_markets: [],
      pending_role: -1,
      primary_email: '',
      secondary_email: '',
      user_id: -1,
      geo: '', // TODO array
      markets: []
    },
    accessEmpty: {
      approval: -1,
      given_name: '',
      given_role: -1,
      is_disabled: true,
      last_name: '',
      pending_geo: -1, // TODO array
      pending_markets: [],
      pending_role: -1,
      primary_email: '',
      secondary_email: '',
      user_id: -1,
      geo: '', // TODO array
      markets: []
    },
    rejectAccess: {}
  }),

  methods: {
    revokeAccess(status) {
      this.rejectAccess = {
        geo: this.access.pending_geo, // TODO make sure works w/ array
        markets: this.access.pending_markets,
        user_id: this.access.user_id
      };

      status === 'true'
        ? (this.rejectAccess.reject = true)
        : (this.rejectAccess.reject = false);

      this.$store.dispatch('accesses/approveAccess', this.rejectAccess);

      setTimeout(() => {
        Object.assign(this.access, this.accessEmpty);
        Object.assign(this.rejectAccess, {});
      }, 200);

      status === 'true'
        ? (this.showDeleteDialog = false)
        : (this.showApproveDialog = false);
    }
  }
};
