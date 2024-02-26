<template>
  <v-row>
    <!-- <v-row v-if="true"> -->
    <v-col cols="12">
      <v-card class="pre">
        <v-card-title fluid>
          Approval Letter
        </v-card-title>
        <v-card-text
          ><v-btn
            v-if="showExportPdf"
            block
            color="primary"
            :disabled="exporting"
            @click.stop="exportPDF"
          >
            Export to PDF
          </v-btn>
          <template v-if="showCustomApproval">
            <h4>Custom approval text</h4>
            <p style="white-space: pre-wrap">{{ customApproval }}</p>
          </template>
          <template v-if="showClauses">
            <h4>Standard Clauses</h4>
            <ul>
              <li
                v-for="(clause, index) in standardClauses"
                :key="`standardclause-${index}`"
              >
                {{ clause }}
              </li>
            </ul>
          </template>
          <template v-if="approvalFiles.length > 0">
            <h4>Approver attachments</h4>
            <v-chip-group>
              <v-chip
                v-for="file in approvalFiles"
                :key="`approvalfile${file.file}`"
                @click.stop="downloadFile(file.file)"
              >
                {{ file.short }}
              </v-chip>
            </v-chip-group>
          </template>
          <template v-if="termsAndConditions.length > 0">
            <h4>Terms and Conditions</h4>
            <p
              v-for="(term, index) in termsAndConditions"
              :key="'term-' + index"
            >
              {{ term.text }}
            </p>
          </template>
          <deal-sum-table v-if="dealSum" />
        </v-card-text>
      </v-card>
      <pdf-approval-letter id="pdfSection">
        <template slot="approval-letter">
          <template v-if="showCustomApproval">
            <h2>Custom approval text</h2>
            <p style="white-space: pre-wrap">{{ customApproval }}</p>
          </template>
          <template v-if="showClauses">
            <h2>Standard Clauses</h2>
            <ul>
              <li
                v-for="(clause, index) in standardClauses"
                :key="`standardclause-${index}`"
              >
                <p class="list-element">
                  {{ clause }}
                </p>
              </li>
            </ul>
          </template>
          <template v-if="termsAndConditions.length > 0">
            <h2>Terms and Conditions</h2>
            <ul>
              <li
                v-for="(term, index) in termsAndConditions"
                :key="'term-' + index"
              >
                <p class="list-element">
                  {{ term.text }}
                </p>
              </li>
            </ul>
          </template>
        </template>
        <template slot="deal-sum">
          <deal-sum-table v-if="dealSum" />
        </template>
      </pdf-approval-letter>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex';
import DealSumTable from '@/components/autoForm/DealSumTable';
import PdfApprovalLetter from '@/components/autoForm/PdfApprovalLetter';
import html2pdf from 'html2pdf.js';

export default {
  name: 'ApprovalLetter',

  components: {
    DealSumTable,
    PdfApprovalLetter
  },
  data: function() {
    return {
      exporting: false
    };
  },

  computed: {
    ...mapState({
      deal: state => state.deals.deal,
      standardClauses: state => state.deals.deal.approvalClauses,
      customApproval: state => state.deals.deal.approvalComment,
      approvalFiles: state =>
        state.deals.deal.approvalFiles
          ? state.deals.deal.approvalFiles.reduce((r, file) => {
              const fileSplitted = file.split('__');
              r.push({ file, short: fileSplitted[fileSplitted.length - 1] });
              return r;
            }, [])
          : [],
      termsAndConditions: state =>
        state.deals.deal.termsAndConditions.reduce((r, t) => {
          if (t.approved === 'approved') r.push(t);
          return r;
        }, []),
      dealSum: state => {
        return state.deals.deal.dealSum != null;
      },
      userRole: state => state.user.role,
      dealState: state => state.deals.deal.status,
      opNumber: state => state.deals.deal.opportunityNumber
    }),
    showCustomApproval() {
      return this.customApproval ? this.customApproval.length > 0 : false;
    },
    showClauses() {
      return this.standardClauses ? this.standardClauses.length > 0 : false;
    },
    showExportPdf() {
      if (
        (this.dealState === 'approved' ||
          this.dealState === 'signed' ||
          this.dealState === 'bid_repaired' ||
          this.dealState === 'loss' ||
          this.dealState === 'slipped') &&
        (this.userRole === 'Dealmaker' ||
          this.userRole === 'Reader' ||
          this.userRole === 'Approver' ||
          this.userRole === 'Reviewer1' ||
          this.userRole === 'Reviewer2' ||
          this.userRole === 'Admin')
      )
        return true;
      if (this.dealState === 'iterated') return true;
      return false;
    }
  },
  methods: {
    downloadFile(fileName, dmss = false) {
      this.$store.dispatch('deals/downloadFile', {
        filename: fileName,
        dmss: dmss
      });
    },
    async exportPDF() {
      this.exporting = true;
      this.$store.dispatch('notifications/createNotification', {
        title: 'PDF Export',
        severity: 'info',
        caption: 'Export started...'
      });
      let element = document.getElementById('pdfSection');
      element.style.visibility = 'visible';
      element.style.height = 'auto';
      await html2pdf()
        .set({
          margin: 0.3,
          filename: `approval letter - ${this.opNumber}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
      element.style.visibility = 'hidden';
      element.style.height = 0;
      this.$store.dispatch('notifications/createNotification', {
        title: 'PDF Export',
        severity: 'info',
        caption: 'Export complete!'
      });
      this.exporting = false;
    }
  }
};
</script>

<style lang="scss" scoped>
#pdfSection {
  visibility: hidden;
  height: 0;
}
.list-element {
  margin-top: 10px;
  margin-left: 5px;
}
</style>
