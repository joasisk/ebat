<template>
  <v-container fluid class="pt-1">
    <v-row v-if="clonedFrom">
      <v-col>
        <h3 class="ml-8">
          Cloned from: <a :href="`/request/${clonedFrom}`">{{ clonedFrom }}</a>
        </h3>
      </v-col>
    </v-row>
    <v-row v-for="(row, index) in form.rows" :key="`row-${index}`">
      <template v-for="(col, cindex) in row.columns">
        <v-col
          v-if="sectionAccessible(col)"
          :key="`col-${index}-${cindex}`"
          :cols="col.width"
        >
          <v-card
            :id="col.comments"
            :color="
              hasReviewPending(deal[col.comments])
                ? 'blueGreyLight'
                : 'greyContrast'
            "
            :elevation="hasReviewPending(deal[col.comments]) ? 24 : 0"
          >
            <v-card-title v-if="col.title">{{ col.title }}</v-card-title>
            <v-container>
              <question
                v-for="(question, qindex) in col.questions"
                :key="`question-${index}-${cindex}-${qindex}`"
                :ref="`question${index}${cindex}${qindex}`"
                :question="question"
                :disabled="!submitAllowedDmss(question)"
                :parent-value="
                  question.config ? form.data[question.config.parentValue] : {}
                "
                @error="toggleErrorState"
                @countryUpdate="handleCountryCode"
              />

              <!-- card actions -->
              <template v-if="col.topAction && submitAllowed">
                <v-speed-dial top right absolute direction="left">
                  <template v-slot:activator>
                    <v-btn
                      fab
                      :small="col.topAction.small"
                      :color="col.topAction.color"
                    >
                      <v-icon>{{ col.topAction.icon }}</v-icon>
                    </v-btn>
                  </template>
                  <template v-if="col.topAction">
                    <v-btn
                      v-for="(action, actionIndex) in col.topAction.actions"
                      :key="`column-action-${actionIndex}`"
                      :color="action.color"
                      :small="action.small"
                      :rounded="action.rounded"
                      :fab="action.fab"
                      @click.stop="click(action.click)"
                    >
                      <v-icon>{{ action.icon }}</v-icon>
                      {{ action.text }}
                    </v-btn>
                  </template>
                </v-speed-dial>
              </template>

              <v-data-table
                v-if="col.table.hasTable"
                :dense="col.table.dense"
                :disable-sort="!col.table.sortable"
                :disable-filtering="!col.table.searchable"
                :headers="col.table.headers"
                :items="form.data[col.table.rows]"
              >
                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn
                    v-for="(action, ai) in col.table.inlineActions"
                    v-show="submitAllowed"
                    :key="`${item.id}-${ai}`"
                    right
                    icon
                    :color="action.color"
                    @click.stop="click(action.click, item)"
                  >
                    <v-icon>{{ action.icon }}</v-icon>
                  </v-btn>
                </template>
              </v-data-table>

              <section>
                <v-divider />
                <comments v-if="col.comments" :section="col.comments" />
              </section>
            </v-container>
            <!-- leaving it here in case they want to review all
             -->
            <!-- <v-card-actions v-if="hasReviewPending(deal[col.comments])">
              <v-spacer />
              <v-btn
                @click="
                  $store.dispatch('deals/resolveReview', {
                    section: col.comments,
                    user: email
                  })
                "
                >Resolve review</v-btn
              >
            </v-card-actions> -->
          </v-card>
        </v-col>
      </template>
      <question-section
        v-if="row.questionSection && roleallowed(row.questionSection.value)"
        :question-section="row.questionSection"
      />
    </v-row>

    <!-- auto overlay -->
    <v-dialog
      v-for="overlay in form.overlays"
      :key="`${overlay.title}-overlay`"
      v-model="overlay.open"
      :edit="overlayEditState"
      max-width="950"
    >
      <v-card>
        <v-card-title>{{ overlay.title }}</v-card-title>
        <v-card-text>
          <template v-for="(question, qindex) in overlay.questions">
            <question
              :key="`${overlay.title}-question-${qindex}`"
              v-model="form.data[overlay.value][question.value]"
              :question="question"
              :disabled="false"
            />
          </template>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-for="action in overlay.actions"
            :key="`${overlay.title}-${action.label}-action`"
            :color="action.color"
            :disabled="getOverlayActionDisabled(action.config, overlay.value)"
            @click="click(action.click)"
          >
            {{ action.label }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- :disabled="disableSaveActions" -->
    <v-fade-transition>
      <v-speed-dial v-if="disableSaveActions" bottom fixed right>
        <template v-slot:activator>
          <v-card class="pa-4" rounded="circle">
            <v-progress-circular indeterminate color="primary" />
          </v-card>
        </template>
      </v-speed-dial>
      <!-- actions -->
      <v-speed-dial v-else v-model="actions" bottom fixed right>
        <!-- open-on-hover -->
        <template v-slot:activator>
          <v-btn
            v-model="actions"
            color="primary"
            rounded
            x-large
            :disabled="disableSubmit"
          >
            Deal actions
          </v-btn>
        </template>
        <!-- dealmaker actions -->
        <template>
          <v-btn
            v-if="requestAnnuityAllowed"
            :disabled="requestAnnuityDisabled"
            rounded
            color="blue"
            @click="requestAnnuity"
          >
            <v-icon>mdi-check-decagram</v-icon> Request annuity
          </v-btn>

          <v-btn
            v-if="submitAllowed"
            rounded
            color="deepOrange"
            @click="submitForm"
          >
            <v-icon>mdi-check-decagram</v-icon> Submit
          </v-btn>

          <v-btn v-if="saveChangesAllowed" rounded @click="submitWIP">
            <v-icon>mdi-file-hidden</v-icon> Save Changes
          </v-btn>
          <v-btn v-if="cloneAllowed" rounded color="purple" @click="cloneDeal">
            <v-icon>mdi-checkbox-multiple-blank-circle</v-icon> Clone
          </v-btn>

          <v-btn v-if="canDelete" rounded color="redDark" @click="deleteDraft">
            <v-icon>mdi-delete</v-icon> Delete Draft
          </v-btn>
        </template>

        <!-- dealmaker after approvement || slipped || loss -->
        <template>
          <v-btn
            v-if="afterApprovement"
            rounded
            color="blueLight"
            @click.stop="resolvedAs('slipped')"
          >
            Resolved as slipped
          </v-btn>
          <v-btn
            v-if="afterApprovement"
            rounded
            light
            color="yellowAccent"
            @click.stop="resolvedAs('loss')"
          >
            Resolved as loss
          </v-btn>
          <v-btn
            v-if="afterApprovement"
            rounded
            color="green"
            @click.stop="resolvedAs('signed')"
          >
            Resolved as signed
          </v-btn>
          <v-btn v-if="iterationAllowed" rounded @click="iterate">
            Iterate
          </v-btn>
        </template>

        <!-- dealmaker after signed -->
        <template>
          <v-btn
            v-if="afterSigned"
            rounded
            color="deepOrange"
            @click.stop="showBidRepairDialog"
          >
            Create bid repair
          </v-btn>
        </template>

        <!-- annuity actions -->
        <template>
          <v-btn
            v-if="assignAnnuityAllowed"
            rounded
            color="green"
            @click="assignAnnuity"
          >
            <v-icon>mdi-account-check</v-icon> Assign<br />annuity to me
          </v-btn>

          <template v-if="baseline">
            <v-tooltip left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  rounded
                  color="green"
                  v-bind="attrs"
                  :disabled="baselineApprovalDisabled"
                  v-on="on"
                  @click="annuityApproveModel = true"
                >
                  Approve annuity
                </v-btn>
              </template>
              <span>Disabled if no attachment is present</span>
            </v-tooltip>

            <v-btn
              rounded
              color="deepOrange"
              @click="annuityRejectModel = true"
            >
              Reject annuity
            </v-btn>
          </template>
        </template>

        <template v-if="role === 'Approver'">
          <v-btn v-if="deal.status === 'submitted'" rounded @click="assignDeal">
            <v-icon>mdi-clipboard-arrow-down</v-icon> Assign to Me
          </v-btn>
        </template>

        <!-- assigned approver actions -->
        <template v-if="role === 'Approver' && deal.approver === email">
          <v-btn
            v-if="deal.status === 'in_pricing'"
            color="green"
            rounded
            @click="showApproverDialog = true"
          >
            <v-icon>mdi-clipboard-check</v-icon>Approve
          </v-btn>
          <v-btn
            v-if="deal.status === 'in_pricing'"
            color="deepOrange"
            rounded
            @click="returnDeal"
          >
            <v-icon>mdi-clipboard-arrow-left</v-icon>Return to <br />
            Dealmaker
          </v-btn>
          <v-btn
            v-if="deal.status === 'approved'"
            rounded
            color="deepOrange"
            @click="withdrawApproval"
          >
            <v-icon>mdi-hand-left</v-icon>Withdraw approval
          </v-btn>
        </template>

        <v-btn
          v-if="smallChangeAllowed"
          color="blue"
          rounded
          @click="saveChanges"
        >
          Save changes
        </v-btn>

        <!-- any role -->
        <template>
          <v-btn v-if="hasIterations" rounded @click="showIterations">
            View Iterations
          </v-btn>
          <v-btn v-if="hasRepairs" rounded @click="showRepairs">
            View Bid Repairs
          </v-btn>
        </template>
      </v-speed-dial>
    </v-fade-transition>

    <!-- Review dialog -->
    <v-dialog v-model="showReviewDialog" persistent width="500px">
      <v-card>
        <v-card-title primary-title>
          Request review for Action item {{ aiIndex + 1 }}
        </v-card-title>
        <v-autocomplete
          v-model="reviewer"
          class="mx-4"
          label="Reviewer"
          item-text="primary_email"
          item-value="primary_email"
          :items="reviewers"
        />

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            text
            @click.stop="$store.dispatch('deals/setAiIndex', null)"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            text
            :disabled="reviewAllowed"
            @click="requestReview"
            >Request review</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- approver dialog -->
    <v-dialog v-model="showApproverDialog" persistent width="700px">
      <v-card>
        <v-card-title primary-title>
          Approval details
        </v-card-title>
        <v-container>
          <v-row>
            <v-col cols="8">
              <v-select
                v-model="approvalClauses"
                multiple
                outlined
                dense
                label="Standard Clauses"
                :items="form.approvalClauses"
              />
              <v-textarea
                v-model="approvalComment"
                outlined
                dense
                label="Custom approval text"
              />
              <v-progress-circular
                v-show="loadingApprovalFiles"
                indeterminate
                color="amber"
              ></v-progress-circular>
              <v-chip-group v-if="approvalFileChips">
                <v-chip
                  v-for="(file, index) in approvalFileChips"
                  v-show="!loadingApprovalFiles"
                  :key="`approvalfile${index}`"
                  color="red"
                  @click.stop="deleteFile(index)"
                >
                  <v-icon>mdi-close</v-icon>
                  {{ file.short }}
                </v-chip>
              </v-chip-group>
              <v-file-input
                v-model="approvalFiles"
                outlined
                multiple
                dense
                label="Approval supporting documents"
              />
            </v-col>
            <v-col cols="4">
              <p>Approval letter will also include:</p>
              <ul>
                <li>deal sum from the DMSS attached (if available)</li>
                <li>any approved terms and conditions texts (if any)</li>
                <li>link to download DMSS file (if available)</li>
              </ul>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelApproval">Cancel</v-btn>
          <v-btn color="green" @click="approveDeal">Approve</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bid repair dialog -->
    <v-dialog v-model="bidRepairDialog" persistent width="500px">
      <v-card>
        <v-card-title primary-title>
          Are you sure, you want to repair this bid?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click.stop="bidRepairDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" text @click="repairBid">Repair bid</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- annuity dialogs -->
    <v-dialog v-model="annuityRejectModel" persistent width="500px">
      <v-card>
        <v-card-title>Return to dealmaker</v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            text
            @click.stop="annuityRejectModel = false"
          >
            Cancel
          </v-btn>
          <v-btn color="red" text @click="returnAnnuity">Return</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="annuityApproveModel" persistent width="500px">
      <v-card>
        <v-card-title>Approve baseline</v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            text
            @click.stop="annuityApproveModel = false"
          >
            Cancel
          </v-btn>
          <v-btn color="green" text @click="approveAnnuity">Approve</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import formMixin from '@/mixins/form.mixin';

import { ROLES } from '@/config/roles.js';
import { mapGetters, mapState } from 'vuex';
import Comments from './Comments';
import Question from './Question';
import QuestionSection from './QuestionSection';

export default {
  name: 'AutoForm',

  components: {
    Comments,
    Question,
    QuestionSection
  },

  mixins: [formMixin],

  props: {
    form: {
      type: Object,
      default: () => ({})
    }
  },

  data: () => ({
    annuityApproveModel: false,
    annuityRejectModel: false,
    actions: false,
    disableSubmit: false,
    formError: {},
    reviewer: '',
    overlayEditState: false,
    showApproverDialog: false,
    // approval letter values
    approvalClauses: [],
    approvalComment: '',
    approvalFiles: [],

    bidRepairDialog: false,
    roles: ROLES,
    loadingApprovalFiles: false
  }),

  computed: {
    ...mapGetters('delegation', ['getActiveMasterList']),
    ...mapState({
      email: state => state.user.primary.toLowerCase(),
      reviewers: state => state.users.reviewers,
      deal: state => {
        return {
          ...state.deals.deal
        };
      },
      clonedFrom: state => state.deals.deal.clonedFrom,
      role: state => state.user.role,
      dealID: state => state.deals.deal._id,
      aiIndex: state => state.deals.aiIndex,
      dealLoading: state => state.deals.loading,
      socketMessages: state => state.sockets.requests
    }),

    baselineApprovalDisabled() {
      return (
        this.deal.annuityAttachment == '' || this.deal.annuityAttachment == null
      );
    },

    baseline() {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!this.deal.annuityUserEmail) {
        return (
          this.role === 'Annuity' &&
          this.deal.annuityUserEmail.toLowerCase() ===
            this.email.toLowerCase() &&
          this.deal.status === 'draft' &&
          this.deal.annuityFlag === 'IB'
        );
      } else {
        return false;
      }
    },

    dealmakerHasAccess() {
      if (this.deal.dealmaker == null) {
        return false;
      }
      if (this.role !== 'Dealmaker') {
        return false;
      }
      const user_list = [...this.getActiveMasterList, this.email.toLowerCase()];
      const DM = this.deal.dealmaker.toLowerCase();
      return user_list.includes(DM);
    },

    approvalFileChips() {
      if (this.deal.approvalFiles == null) return [];
      return this.deal.approvalFiles.reduce((r, f) => {
        const cutF = f.split('__');
        r.push({ file: f, short: cutF[cutF.length - 1] });
        return r;
      }, []);
    },

    showReviewDialog() {
      return this.aiIndex != null;
    },

    hasIterations() {
      return (
        this.deal.previousIteration != null || this.deal.nextIteration != null
      );
    },

    hasRepairs() {
      return this.deal.bidRepair !== null || this.deal.repairing !== null;
    },

    iterationAllowed() {
      const ITERABLE_STATE =
          this.deal.status === 'approved' ||
          this.deal.status === 'slipped' ||
          this.deal.status === 'loss',
        NOT_ITERATED_YET = this.deal.nextIteration == null;
      return this.dealmakerHasAccess && ITERABLE_STATE && NOT_ITERATED_YET;
    },

    submitAllowed() {
      const SUBMITTABLE_STATE =
        this.deal._id == null ||
        this.deal.status === 'rejected' ||
        this.deal.status === 'in_progress_dm' ||
        (this.deal.status === 'draft' && this.deal.annuityFlag === 'BA') ||
        (this.deal.status === 'draft' &&
          this.deal.baselineRequired === false) ||
        (this.deal.status === 'draft' &&
          this.deal.baselineRequired === undefined);
      return this.dealmakerHasAccess && SUBMITTABLE_STATE;
    },

    requestAnnuityAllowed() {
      return (
        this.dealmakerHasAccess &&
        this.deal.status === 'draft' &&
        !this.deal.annuityFlag &&
        this.deal.baselineRequired === true
      );
    },
    requestAnnuityDisabled() {
      return this.deal.dbgNumber > 10000000;
    },

    assignAnnuityAllowed() {
      return (
        this.role === 'Annuity' &&
        this.deal.status === 'draft' &&
        this.deal.annuityFlag === 'BR'
      );
    },

    approveAnnuityAllowed() {
      return (
        this.role === 'Annuity' &&
        this.deal.status === 'draft' &&
        this.deal.annuityFlag === 'IB'
      );
    },

    cloneAllowed() {
      return (
        this.dealmakerHasAccess &&
        (this.deal.status === 'draft' || this.deal.status === 'submitted') &&
        this.deal.iteration === 0 &&
        !this.hasRepairs &&
        this.deal.copyOf === null &&
        !this.hasIterations
      );
    },

    saveChangesAllowed() {
      const SAVEABLE_STATE =
        this.deal.status === 'draft' ||
        this.deal.status === 'in_progress_dm' ||
        this.deal.status === 'rejected';
      return this.dealmakerHasAccess && SAVEABLE_STATE;
    },

    canDelete() {
      const DELETABLE_STATE = this.deal.status === 'draft';
      return this.dealmakerHasAccess && DELETABLE_STATE;
    },

    reviewAllowed() {
      return this.reviewer === '' || this.email === this.reviewer;
    },

    afterApprovement() {
      if (this.deal.status !== 'approved') {
        return false;
      }

      if (this.role === 'Approver') {
        const user_list = [
          ...this.getActiveMasterList,
          this.email.toLowerCase()
        ];
        return user_list.includes(this.deal.approver.toLowerCase());
      }

      return this.dealmakerHasAccess;
    },

    afterSigned() {
      return (
        this.deal.status === 'signed' &&
        this.deal.bidRepair === null &&
        this.dealmakerHasAccess &&
        !this.hasIterations
      );
    },

    roleID() {
      return this.roles.find(r => r.role === this.role).role_id;
    },

    smallChangeAllowed() {
      if (this.role === 'Approver' && this.deal.status === 'in_pricing')
        return true;
      const REVS = ['Reviewer1', 'Reviewer2', 'Reviewer3'];
      const STATES = ['in_progress_dm', 'submitted', 'in_pricing'];
      return REVS.includes(this.role) && STATES.includes(this.deal.status);
    },

    disableSaveActions() {
      return this.socketMessages.length > 0;
    }
  },

  watch: {
    showReviewDialog: function() {
      this.reviewer = '';
    }
    // dealLoading(loading) {
    //   if (!loading) {
    //   }
    // }
  },
  mounted() {
    // DEBUG: keep this for future debugging
    // this.form.rows.forEach(row => {
    //   row.columns.forEach(column => {
    //     column.questions.forEach(question => {
    //       console.log(question.value, this.form.data[question.value]);
    //     });
    //   });
    // });
    this.approvalClauses = this.deal.approvalClauses
      ? this.deal.approvalClauses
      : [];
    this.approvalComment = this.deal.approvalComment
      ? this.deal.approvalComment
      : '';
  },
  methods: {
    async requestAnnuity() {
      const refKeys = Object.keys(this.$refs);
      refKeys.forEach(key => {
        if (
          this.$refs[key][0].question.value == 'market/sector' ||
          this.$refs[key][0].question.value == 'geo'
        ) {
          this.$refs[key][0].validate();
        }
      }, this);
      setTimeout(() => {
        if (this.disableSubmit) return;
        this.$store.dispatch('deals/requestAnnuity');
      }, 200);
    },
    async assignAnnuity() {
      await this.$store.dispatch('deals/assignAnnuity');
    },
    returnAnnuity() {
      this.$store.dispatch('deals/annuityReturn');
    },
    approveAnnuity() {
      this.$store.dispatch('deals/annuityApprove');
    },
    withdrawApproval() {
      this.$store.dispatch('deals/withdraw');
    },

    roleallowed(sq) {
      return this.role != 'Reviewer3' || sq == 'actionItem';
    },

    deleteFile(index) {
      this.loadingApprovalFiles = true;
      this.$store
        .dispatch('deals/deleteApprovalFile', { index })
        .then(() => (this.loadingApprovalFiles = false))
        .catch(() => (this.loadingApprovalFiles = false));
    },
    cloneDeal() {
      this.$store.dispatch('deals/cloneDeal');
    },
    cancelApproval() {
      this.showApproverDialog = false;
      this.approvalClauses = [];
      this.approvalComment = '';
    },

    showBidRepairDialog() {
      this.bidRepairDialog = true;
    },
    repairBid() {
      this.$store.dispatch('deals/repairBid');
      this.bidRepairDialog = false;
    },
    saveChanges() {
      this.$store.dispatch('deals/saveChanges');
    },

    hasReviewPending(data) {
      if (data == null) {
        return false;
      }
      return data.reviews
        ? data.reviews.some(
            r =>
              r.email.toLowerCase() === this.email.toLowerCase() && !r.approved
          )
        : false;
    },

    iterate() {
      this.$store.dispatch('deals/iterate', { id: this.dealID });
    },

    click(action, payload) {
      if (action.action === 'openOverlay') {
        this.openOverlay(action.overlay, action.parameter, action.data);
      }

      if (action.action === 'closeOverlay') {
        this.closeOverlay(action.overlay, action.parameter, action.empty);
      }

      if (action.action === 'confirmProjectOverlay') {
        this.confirmProjectOverlay(
          action.overlay,
          action.parameter,
          action.value,
          action.empty,
          action.originParam
        );
      }

      if (action.action === 'removeProject')
        this.removeItem(
          action.parameter,
          action.trackBy,
          payload[action.trackBy]
        );

      if (action.action === 'editProject') {
        this.openOverlay(action.overlay, action.parameter, payload);
      }

      if (action.action == 'confirmEditOverlay') {
        this.confirmEditOverlay(
          action.overlay,
          action.parameter,
          action.originParam,
          action.findBy,
          action.empty
        );
      }
    },

    toggleErrorState(err) {
      this.formError[err.q] = err.state;
      this.parseError();
    },

    parseError() {
      let err = Object.keys(this.formError).some(key => {
        return this.formError[key] != null;
      });
      this.disableSubmit = err;
    },

    handleCountryCode(code) {
      this.form.data.countryCode = code;
    },

    requestReview() {
      if (this.reviewer !== '') {
        let aiIndex = this.aiIndex;
        if (this.role === 'Dealmaker') {
          this.$store.dispatch('deals/updateAsync').then(() => {
            this.$store.dispatch('deals/addReviewer', {
              id: this.dealID,
              reviewer: this.reviewer,
              section: 'actionItem',
              index: aiIndex
            });
          });
        } else {
          this.$store.dispatch('deals/saveChangesAsync').then(() => {
            this.$store.dispatch('deals/addReviewer', {
              id: this.dealID,
              reviewer: this.reviewer,
              section: 'actionItem',
              index: aiIndex
            });
          });
        }
      }
      this.$store.dispatch('deals/setAiIndex', null);
    },

    submitForm() {
      this.deal.createdDate = Date.now();
      const refKeys = Object.keys(this.$refs);
      refKeys.forEach(key => {
        if (
          (key === 'question100' || key === 'question101') &&
          (this.deal.baselineRequired === false ||
            this.deal.baselineRequired == undefined)
        )
          return;
        this.$refs[key][0].validate();
      }, this);
      setTimeout(() => {
        if (this.disableSubmit) return;
        this.$store.dispatch('deals/submit');
        this.$router.push('/');
      }, 200);
    },

    saveDraft() {
      this.$store.dispatch('deals/draft', {
        ...this.form.data
      });
    },

    submitWIP() {
      this.$store.dispatch('deals/update');
    },

    assignDeal() {
      this.$store.dispatch('deals/assign', this.dealID);
    },

    approveDeal() {
      this.$store.dispatch('deals/approve', {
        id: this.dealID,
        approvalComment: this.approvalComment,
        approvalClauses: this.approvalClauses,
        approvalFiles: this.approvalFiles,
        socketid: window.btoa(this.email)
      });
    },

    returnDeal() {
      this.$store.dispatch('deals/reject', this.dealID);
    },

    deleteDraft() {
      this.$store.dispatch('deals/deleteDraft', { id: this.deal._id });
    },

    getOverlayActionDisabled(config, value) {
      if (config == null) return false;
      if (this.form.data[value][config.disabled.if.parameter] == null)
        return false;
      const ifNull =
        this.form.data[value][config.disabled.if.parameter].index == null;
      let orParam = false;
      if (config.disabled.or) {
        if (this.form.data[value][config.disabled.or.parameter] != null) {
          orParam =
            this.form.data[value][config.disabled.or.parameter] ==
            config.disabled.or.value;
        }
      }
      return ifNull || orParam;
    },

    sectionAccessible(col) {
      if (col.title === 'Annuity form')
        return (
          col.access.some(user => user === this.roleID) &&
          this.deal.baselineRequired
        );
      return col.access.some(user => user === this.roleID);
    },

    resolvedAs(type) {
      if (type === 'signed' || type === 'loss' || type === 'slipped')
        this.$store.dispatch('deals/resolve', type);
      else throw new Error('Non valid resolve type');
    },

    submitAllowedDmss(question) {
      if (question.value === 'baselineRequired') {
        const ROLE_HAS_ACCESS = this.role === 'Dealmaker';
        const SUBMITTABLE_STATE =
          this.deal.status === 'draft' && !('annuityFlag' in this.deal);
        return ROLE_HAS_ACCESS && SUBMITTABLE_STATE;
      }
      if (question.value === 'dmss') {
        const ROLE_HAS_ACCESS = this.role === 'Dealmaker';
        const SUBMITTABLE_STATE =
          (this.deal.status === 'draft' && this.deal.annuityFlag === 'BA') ||
          (this.deal.status === 'draft' &&
            this.deal.baselineRequired === false) ||
          (this.deal.status === 'draft' &&
            this.deal.baselineRequired == null) ||
          this.deal.status === 'in_progress_dm' ||
          this.deal.status === 'rejected';
        return ROLE_HAS_ACCESS && SUBMITTABLE_STATE;
      }
      if (question.value === 'dmssAnalyzer') {
        const ROLE_HAS_ACCESS = this.role === 'Approver';
        const SUBMITTABLE_STATE = this.deal.status === 'in_pricing';
        return ROLE_HAS_ACCESS && SUBMITTABLE_STATE;
      }
      const ROLE_HAS_ACCESS = this.dealmakerHasAccess;
      const SUBMITTABLE_STATE =
        this.deal._id == null ||
        this.deal.status === 'rejected' ||
        this.deal.status === 'in_progress_dm' ||
        this.deal.status === 'draft';
      return ROLE_HAS_ACCESS && SUBMITTABLE_STATE;
    },

    showIterations() {
      if (this.deal.previousIteration) {
        this.$store.dispatch('deals/getDeal2', this.deal.previousIteration);
        this.$router.push(`/compare/${this.dealID}`);
      } else {
        this.$store.dispatch('deals/getDeal2', this.dealID);
        this.$store.dispatch('deals/getDeal', this.deal.nextIteration);

        this.$router.push(`/compare/${this.dealID}`);
      }
    },

    showRepairs() {
      if (this.deal.repairing) {
        this.$store.dispatch('deals/getDeal2', this.deal.repairing);
        this.$router.push(`/repair_compare/${this.dealID}`);
      } else {
        this.$store.dispatch('deals/getDeal2', this.dealID);
        this.$store.dispatch('deals/getDeal', this.deal.bidRepair);
        this.$router.push(`/repair_compare/${this.deal.bidRepair}`);
      }
    }
  }
};
</script>
