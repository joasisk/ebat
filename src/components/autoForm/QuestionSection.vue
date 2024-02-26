<template>
  <v-container fluid>
    <v-row>
      <v-col
        v-for="(section, index) in sectionValue"
        v-show="
          questionSection.value != 'actionItem' ||
            role != 'Reviewer3' ||
            ('Reviewer3' == role && section.hasReviewPending)
        "
        :id="`${questionSection.value}${index}`"
        :key="`section-${questionSection.value}-${index}`"
        cols="12"
        :md="calculateSectionWidthMedium(section.text)"
        :lg="calculateSectionWidthLarge(section.text)"
        :xl="calculateSectionWidthLarge(section.text)"
      >
        <v-card
          :color="section.hasReviewPending ? 'blueGreyLight' : 'greyContrast'"
          :elevation="section.hasReviewPending ? 24 : 0"
        >
          <v-card-title>
            {{ questionSection.title }} {{ index + 1 }}
            <v-spacer />
            <v-chip
              v-if="questionSection.requiresApproval"
              :color="approvedStatusColor(section.approved)"
            >
              <b>{{ section.approved == '' ? 'pending' : section.approved }}</b>
            </v-chip>
          </v-card-title>
          <v-container>
            <v-textarea
              v-if="questionSection.hasText"
              v-debounce="
                text =>
                  $store.dispatch('deals/updateSectionText', {
                    section: questionSection.value,
                    index,
                    text
                  })
              "
              dense
              outlined
              :readonly="
                (!dealmakerCanEdit &&
                  !approverCanEditText &&
                  !reviewerCanEdit) ||
                  role == 'Reviewer3'
              "
              :label="`${questionSection.title} ${index + 1} text`"
              :value="section.text"
            />
            <template v-if="questionSection.hasFile">
              <v-file-input
                v-if="
                  (section.file && section.file.length === 0) ||
                    questionSection.value === 'actionItem'
                "
                dense
                multiple
                outlined
                :disabled="
                  (!dealmakerCanEdit && !approverCanEdit && !reviewerCanEdit) ||
                    role == 'Reviewer3'
                "
                :label="`${questionSection.title} attachment`"
                @change="updateValueFile($event, questionSection.value, index)"
              />
              <template
                v-if="section.file && section.file.length > 0"
                class="pt-0 mt-0"
              >
                <h5>
                  {{ `${questionSection.title} attachment:` }}
                </h5>
                <v-chip-group column class="chip-group">
                  <v-chip
                    v-for="(f, i) in section.file"
                    :key="`file-chip-${i}`"
                    class="mb-1 max-width-chip"
                    pill
                    :close="
                      dealmakerCanEdit || approverCanEdit || reviewerCanEdit
                    "
                    @click.stop="downloadFile(f, questionSection.value, index)"
                    @click:close="
                      removeFile(
                        questionSection.value,
                        index,
                        f,
                        i,
                        section.file
                      )
                    "
                  >
                    <v-avatar left>
                      <!-- FIXME: progress od downloading is not ending -->
                      <v-progress-circular
                        v-if="downloadStarted[i]"
                        right
                        class="ml-2"
                        size="15"
                        width="3"
                        indeterminate
                      />
                      <v-icon v-else right small class="ml-1"
                        >mdi-arrow-down-circle</v-icon
                      >
                    </v-avatar>

                    {{
                      section.file[i]
                        .split('__')
                        .splice(2)
                        .join('__')
                    }}
                  </v-chip>
                </v-chip-group>
              </template>
            </template>
            <!-- @click:clear="clearValueFile(questionSection.value, index)" -->
            <v-divider />
            <template v-if="section.reviews && section.reviews.length > 0">
              <h4>Reviews:</h4>
              <v-list>
                <v-list-item
                  v-for="(review, reviewIndex) in section.reviews"
                  :key="`${review.email}-${index}-${reviewIndex}`"
                >
                  <v-list-item-avatar
                    ><v-img
                      :src="
                        `https://w3-unifiedprofile-api-production.dal1a.cirrus.ibm.com/v3/image/${review.email}?type=bp&def=avatar&s=50x50&disableCaching=false`
                      "
                  /></v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ review.email }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      review.concluded ? 'done' : 'pending'
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-divider />
            </template>
            <comments
              v-if="questionSection.hasComments"
              :section="questionSection.value"
              :question-section-index="index"
            />
          </v-container>
          <v-card-actions
            v-if="
              approverCanApprove || section.hasReviewPending || addReviewAllowed
            "
          >
            <v-spacer />
            <v-btn
              v-if="approverCanApprove"
              color="red"
              :disabled="section.approved === 'rejected'"
              @click="
                $store.dispatch('deals/updateSectionApproval', {
                  id: dealId,
                  section: questionSection.value,
                  index,
                  approval: 'reject',
                  updateText: deal.termsAndConditions[index].text
                })
              "
            >
              reject
            </v-btn>
            <v-btn
              v-if="approverCanApprove"
              color="green"
              :disabled="section.approved === 'approved'"
              @click="
                $store.dispatch('deals/updateSectionApproval', {
                  id: dealId,
                  section: questionSection.value,
                  index,
                  approval: 'approve',
                  updateText: deal.termsAndConditions[index].text
                })
              "
            >
              approve
            </v-btn>
            <v-btn
              v-if="section.hasReviewPending"
              :disabled="fileUploading"
              @click="
                $store.dispatch('deals/resolveReview', {
                  section: questionSection.value,
                  index,
                  user
                })
              "
            >
              Resolve review
            </v-btn>
            <v-btn
              v-if="addReviewAllowed"
              :disabled="addReviewDisabledButton"
              @click="$store.dispatch('deals/setAiIndex', index)"
            >
              Add reviewer
            </v-btn>
            <span v-if="noMarket">requires market</span>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col
        v-if="
          questionSection.maxCount > 1 &&
            (dealmakerCanEdit || approverCanEdit || reviewerCanEdit)
        "
        cols="12"
        md="2"
      >
        <v-card color="greyContrast" class="pa-0">
          <v-card-title>
            You can add
            {{ questionSection.maxCount - count }}
            {{ questionSection.title }} sections
          </v-card-title>
          <v-container>
            <v-tooltip left>
              <template v-slot:activator="{ on }">
                <v-btn
                  :disabled="questionSection.maxCount - count === 0"
                  v-on="on"
                  @click="addSection"
                >
                  <v-icon>mdi-plus-box-multiple</v-icon>
                </v-btn>
              </template>
              <span>Add another {{ questionSection.title }} section</span>
            </v-tooltip>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import Comments from './Comments.vue';
export default {
  name: 'QuestionSection',
  components: { Comments },
  props: {
    questionSection: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters('delegation', ['getActiveMasterList']),
    ...mapState({
      sectionValue(state) {
        return state.deals.deal[this.questionSection.value]
          ? state.deals.deal[this.questionSection.value]
              .filter(v => !!v)
              .map(v => {
                if (this.questionSection.value === 'actionItem')
                  v.hasReviewPending = this.hasReviewPending(v);
                return v;
              })
          : [];
      },
      status: state => state.deals.deal.status,
      annuityFlag: state => state.deals.deal.annuityFlag,
      role: state => state.user.role,
      user: state => state.user.primary.toLowerCase(),
      deal: state => state.deals.deal,
      approver: state => state.deals.deal.approver.toLowerCase(),
      delegatedToMe: state => state.delegation.delegatedToMe,
      dealId: state => state.deals.deal._id,
      downloadStarted: state => state.deals.downloadStarted,
      dealMarket: state => state.deals.deal['market/sector'],
      socket: state => state.sockets.requests
    }),
    addReviewAllowed() {
      const ROLE_CAN_ADD_REVIEW =
          this.role !== 'Admin' && this.role !== 'Reader',
        REVIEWAL_STATE =
          (this.status === 'draft' &&
            (this.annuityFlag === undefined || this.annuityFlag === 'BA')) ||
          this.status === 'in_progress_dm' ||
          this.status === 'in_pricing' ||
          this.status === 'rejected' ||
          this.status === 'submitted',
        IS_ACTION_ITEM = this.questionSection.value == 'actionItem';
      return ROLE_CAN_ADD_REVIEW && REVIEWAL_STATE && IS_ACTION_ITEM;
    },
    noMarket() {
      return this.dealMarket === '';
    },
    fileUploading() {
      return this.socket.filter(e => e.status === 'U').length > 0;
    },
    addReviewDisabledButton() {
      return this.dealMarket === '' || this.fileUploading;
    },
    count() {
      return this.sectionValue.length;
    },
    dealmakerCanEdit() {
      return (
        this.role === 'Dealmaker' &&
        (this.status === 'draft' || this.status === 'in_progress_dm')
      );
    },
    approverCanEditText() {
      if (this.role !== 'Approver') return false;
      if (this.status !== 'in_pricing') return false;
      if (
        this.questionSection.value === 'termsAndConditions' &&
        this.approver !== this.user
      )
        return false;
      return (
        this.questionSection.value === 'actionItem' ||
        this.questionSection.value === 'document' ||
        (this.questionSection.value === 'termsAndConditions' &&
          this.questionSection.hasText)
      );
    },
    approverCanEdit() {
      if (this.role !== 'Approver') return false;
      if (this.status !== 'in_pricing') return false;
      return (
        this.questionSection.value === 'actionItem' ||
        this.questionSection.value === 'document'
      );
    },
    reviewerCanEdit() {
      if (this.role === 'Reviewer3') {
        if (this.questionSection.value === 'termsAndConditions') return false;
        if (this.questionSection.value === 'document') return false;
        return (
          this.status != 'approved' &&
          this.status != 'signed' &&
          this.status != 'loss' &&
          this.status != 'slipped' &&
          this.status != 'iterated'
        );
      }

      const revs12 = ['Reviewer2', 'Reviewer1'];
      if (revs12.includes(this.role))
        return (
          this.questionSection.value !== 'termsAndConditions' &&
          this.status != 'approved' &&
          this.status != 'signed' &&
          this.status != 'loss' &&
          this.status != 'slipped' &&
          this.status != 'iterated'
        );

      return false;
    },
    approverCanApprove() {
      return (
        this.role === 'Approver' &&
        this.status === 'in_pricing' &&
        this.questionSection.value === 'termsAndConditions'
      );
    },
    isReviewer() {
      const reviewers = ['Reviewer1', 'Reviewer2', 'Reviewer3'];
      return reviewers.includes(this.role);
    }
  },
  methods: {
    hasReviewPending(data) {
      const user_list = [...this.getActiveMasterList, this.user.toLowerCase()];
      if (data == null) {
        return false;
      }
      return data.reviews
        ? data.reviews.some(r => {
            return user_list.includes(r.email.toLowerCase()) && !r.concluded;
          })
        : false;
    },

    addSection() {
      const newSection = {};
      if (this.questionSection.hasText) newSection.text = '';
      if (this.questionSection.hasFile) newSection.file = [];
      if (this.questionSection.hasComments) newSection.comments = [];
      if (this.questionSection.requiresApproval) newSection.approved = '';
      if (this.questionSection.value === 'actionItem') newSection.reviews = [];
      this.$store.dispatch('deals/addSection', {
        section: this.questionSection.value,
        content: newSection
      });
    },
    updateValueFile(files, section, index) {
      files.forEach(file => {
        if (file == null) return;
        if (typeof file.name !== 'string') return;

        const fd = new FormData();
        fd.append('file', file);

        this.$store.dispatch('deals/uploadFile', {
          reqid: this.dealId,
          socketid: window.btoa(this.user),
          fd,
          fileType: section,
          index: index,
          filename: file.name
        });
      });
    },
    removeFile(section, index, fileName, fileIndex, files) {
      files.splice(fileIndex, 1);
      this.$store.dispatch('deals/deleteSectionFile', {
        fileName,
        section,
        reqId: this.dealId
      });
      this.$store.dispatch('deals/updateSectionFile', {
        section,
        index: index,
        file: files
      });
    },
    downloadFile(fileName, type, index, fileIndex) {
      this.$store.dispatch('deals/downloadFile', {
        index,
        fileIndex,
        filename: encodeURIComponent(fileName),
        dmss: type === 'dmss'
      });
    },
    approvedStatusColor(state) {
      if (state === 'approved') return 'greenLight';
      if (state === 'rejected') return 'orange';
      return 'grey';
    },
    calculateSectionWidthMedium(text) {
      let width = 4;
      if (text && text.length > 200) {
        width = 12;
      }
      return width;
    },
    calculateSectionWidthLarge(text) {
      let width = 3;
      if (text) {
        if (text.length > 200 && text.length < 400) {
          width = 6;
        } else if (text.length > 400) {
          width = 12;
        }
      }
      return width;
    }
  }
};
</script>
