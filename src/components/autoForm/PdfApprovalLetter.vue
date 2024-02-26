<template>
  <section class="pdf-content" light>
    <v-card light>
      <v-card-title fluid>
        <h2 class="title">IBM Confidential</h2>
      </v-card-title>
      <v-card-subtitle>
        <h2>ELA Pricing Approval Letter</h2>
      </v-card-subtitle>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col>
              <i>DISCLAIMER: All dates are in YYYY-MM-DD format</i>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Deal status: {{ deal.status }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Deal ID: {{ deal.dealId }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Opportunity Number: {{ deal.opportunityNumber }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>GEO: {{ geo }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Market: {{ market }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Customer Name: {{ deal.customerName }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Channel: {{ deal.channel }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>OIO: {{ deal.oio }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Contract Start Date: {{ deal.contractStartDate }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Contract End Date: {{ deal.contractEndDate }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Contract Duration: {{ deal.duration }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Bid Validity: {{ deal.bidValidity }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Approver: {{ deal.approver }}</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>Time Stamp of Approval: {{ approverTimestamp }}</p>
            </v-col>
          </v-row>
          <span class="html2pdf__page-break" />
          <v-row>
            <v-col class="pdfApprovalLetter">
              <slot name="approval-letter"></slot>
            </v-col>
          </v-row>
          <span class="html2pdf__page-break" />
          <v-row>
            <v-col>
              <slot name="deal-sum"></slot>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </section>
</template>
<script>
import _ from 'lodash';
import { mapState } from 'vuex';
export default {
  name: 'PdfApprovalLetter',
  computed: {
    ...mapState({
      deal: state => state.deals.deal,
      market: state =>
        state.markets.markets.find(
          el => el.market_id === state.deals.deal['market/sector']
        )?.name,
      geo: state =>
        state.geos.geos.find(el => el.geo_id === state.deals.deal.geo)?.name,
      approverTimestamp: state =>
        _.findLast(state.deals.deal.history, el =>
          el.operation.includes('approved deal')
        )?.date
    })
  }
};
</script>
<style lang="scss">
.pdf-content.title {
  text-decoration: underline !important;
}
.pdfApprovalLetter h2 {
  margin-top: 50px !important;
}
</style>
