<template>
  <v-container fluid>
    <v-row>
      <v-scroll-x-transition>
        <v-col v-if="!dealLoading && dealID" class="pt-1" cols="6">
          <info-form :deal-key="'deal'" /> </v-col></v-scroll-x-transition
      ><v-scroll-x-transition>
        <v-col v-if="!dealLoading2 && dealID2" class="pt-1" cols="6">
          <info-form :deal-key="'deal2'" /> </v-col
      ></v-scroll-x-transition>
      <v-btn
        :disabled="!previous"
        color="indigo"
        class="compare-navigation right"
        fab
        @click="prev"
      >
        <v-icon>mdi-page-next</v-icon>
      </v-btn>
      <v-btn
        :disabled="!next"
        color="indigo"
        class="compare-navigation left"
        fab
        @click="nextRepair"
      >
        <v-icon>mdi-page-previous</v-icon>
      </v-btn>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import InfoForm from '../components/iteration/InfoForm.vue';
export default {
  name: 'RepairBidCompare',
  components: { InfoForm },
  computed: {
    ...mapState({
      dealLoading: state => state.deals.loading,
      dealLoading2: state => state.deals.loading2,
      formLoading: state => state.form.loading,
      form: state => state.form.form,
      dealID: state => state.deals.deal._id,
      dealID2: state => state.deals.deal2._id,
      previous: state => state.deals.deal2.repairing,
      next: state => state.deals.deal.bidRepair
    })
  },
  mounted() {
    if (this.form.rows.length === 0) {
      this.$store
        .dispatch('form/getForm', {
          id: this.$route.params['id'],
          dealmaker: this.email
        })
        .then(() => {
          if (this.$route.params['id']) {
            this.$store.dispatch('deals/getDeal2', this.$route.params['id']);
          }
        });
    }
  },
  methods: {
    prev() {
      this.$store.dispatch('deals/getDeal2', this.previous);
      this.$store.dispatch('deals/getDeal', this.dealID2);
    },
    nextRepair() {
      this.$store.dispatch('deals/getDeal2', this.dealID);
      this.$store.dispatch('deals/getDeal', this.next);
    }
  }
};
</script>

<style lang="scss" scoped>
.compare-navigation {
  position: fixed;
  top: 50vh;
  &.left {
    left: 60px;
  }
  &.right {
    right: 5px;
  }
}
</style>
