<template>
  <div>
    <v-scale-transition hide-on-leave>
      <v-container v-if="loading" fluid pt-1>
        <v-row>
          <v-col cols="4"><v-skeleton-loader type="card"/></v-col>
          <v-col cols="4"><v-skeleton-loader type="card"/></v-col>
          <v-col cols="4"><v-skeleton-loader type="card"/></v-col>
        </v-row>
      </v-container>
      <div v-else>
        <auto-form :form="form" :role="role" :deal-i-d="dealID" />
        <v-container fluid>
          <approval-letter v-if="showApprovalLetter" />
          <v-row v-if="history">
            <v-col>
              <history :history="history" />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-scale-transition>
  </div>
</template>

<script>
import AutoForm from '@/components/autoForm/AutoForm';
import History from '@/components/autoForm/History';
import { mapState } from 'vuex';
import ApprovalLetter from '../components/autoForm/ApprovalLetter';
export default {
  name: 'DealView',

  components: {
    AutoForm,
    History,
    ApprovalLetter
  },
  data() {
    return {
      dataLoaded: false
    };
  },
  computed: {
    ...mapState({
      form: state => state.form.form,
      dealId: state => state.deals.deal.id,
      formLoading: state => state.form.formLoading,
      formDataLoading: state => state.deals.loading,
      role: state => state.user.role,
      email: state => state.user.primary,
      dealStatus: state => state.deals.deal.status,
      history: state => state.deals.deal.history,
      dmss: state => {
        if (state.deals.deal.dmss[0] == null) return null;
        const fileSplitted = state.deals.deal.dmss[0]
          .split('__')
          .splice(2)
          .join('__');
        return {
          file: state.deals.deal.dmss[0],
          short: fileSplitted
        };
      },
      dealmakerMaster: state => state.deals.deal.dealmakerMaster,
      marketID: state => state.deals.deal['market/sector']
    }),
    loading() {
      return this.formLoading || this.formDataLoading;
    },
    showApprovalLetter() {
      if (this.role === 'Reviewer3') return false;
      if (this.role === 'Reader')
        return this.dealStatus === 'approved' || this.dealStatus === 'signed';
      const ALLOWED_STATUSES = [
        'approved',
        'signed',
        'loss',
        'slipped',
        'iterated'
      ];
      return ALLOWED_STATUSES.includes(this.dealStatus);
    },
    dealID() {
      return this.$route.params['id'] ? this.$route.params['id'] : this.dealId;
    }
  },

  watch: {
    dealID(newVal, oldVal) {
      if (newVal !== oldVal && oldVal.length > 0 && newVal.length > 0)
        this.getDeal();
    },
    formLoading(loading) {
      if (!loading && !this.dataLoaded && !this.$route.params['id']) {
        this.dataLoaded = true;
        this.$store.dispatch('deals/draft', {
          ...this.form.data
        });
      }
    },
    formDataLoading(loading) {
      if (!loading) {
        let id = window.location.hash.substring(1);
        setTimeout(() => {
          let el = document.getElementById(id);
          if (!el) return;
          el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    },
    marketID(id) {
      if (id !== '' && id) {
        this.$store.dispatch('users/getReviewers', id);
      }
    }
  },
  mounted() {
    if (this.$route.params['id']) {
      this.getDeal();
    } else {
      this.createDraft();
    }
  },
  methods: {
    getDeal() {
      this.$store
        .dispatch('deals/getDeal', this.$route.params['id'])
        .then(() => {
          this.$store.dispatch('form/getFormById', {
            id: this.$route.params['id'],
            dealmaker: this.email,
            dealmakerMaster: this.dealmakerMaster
          });
        });
      if (this.marketID !== '' && this.marketID)
        this.$store.dispatch('users/getReviewers', this.marketID);
      this.$store.dispatch('delegation/getDelegatedToMe');
    },
    createDraft() {
      this.$store.dispatch('form/getForm');
    }
  }
};
</script>

<style></style>
