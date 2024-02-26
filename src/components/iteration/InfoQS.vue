<template>
  <v-container fluid>
    <v-row>
      <v-col v-if="sectionValue.length === 0">
        <v-card color="greyContrast">
          No {{ questionSection.title }} present
        </v-card></v-col
      >
      <v-col
        v-for="(section, index) in sectionValue"
        :key="`section-${questionSection.value}-${index}`"
      >
        <v-card color="greyContrast" class="pa-0">
          <v-card-title>
            {{ questionSection.title }} {{ index + 1 }}
            <v-spacer />
            <v-chip :color="approvedStatusColor(section.approved)">
              <b>{{ section.approved == '' ? 'pending' : section.approved }}</b>
            </v-chip>
          </v-card-title>
          <v-container>
            <v-textarea
              v-if="questionSection.hasText"
              dense
              outlined
              :disabled="!dealmakerCanEdit"
              :label="`${questionSection.title} ${index + 1} text`"
              :value="section.text"
            />
            <template v-if="questionSection.hasFile">
              <template v-if="section.file.length > 0" class="pt-0 mt-0" min>
                <h5>
                  {{ `${questionSection.title} attachment` }}
                </h5>
                <v-chip
                  v-for="(f, i) in section.file"
                  :key="`file-chip-${i}`"
                  :close="dealmakerCanEdit"
                  @click.stop="downloadFile(f, questionSection.value)"
                >
                  {{ section.file[0].split('__')[2] }}
                </v-chip>
              </template>
              <v-file-input
                v-else
                dense
                outlined
                :disabled="!dealmakerCanEdit"
                :label="`${questionSection.title} attachment`"
                :value="section.file"
              />
            </template>
            <info-comments
              v-if="questionSection.hasComments"
              :section="questionSection.value"
              :index="index"
              :deal-key="dealKey"
            />
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import InfoComments from './InfoComments.vue';
export default {
  name: 'InfoQuestionSection',
  components: { InfoComments },
  props: {
    questionSection: {
      type: Object,
      required: true
    },
    dealKey: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState({
      sectionValue(state) {
        return state.deals[this.dealKey][this.questionSection.value]
          ? state.deals[this.dealKey][this.questionSection.value]
          : [];
      },
      status(state) {
        return state.deals[this.dealKey].status;
      },
      role: state => state.user.role,
      user: state => state.user.primary,
      dealId(state) {
        return state.deals[this.dealKey]._id;
      }
    }),
    count() {
      return this.sectionValue.length;
    },
    dealmakerCanEdit() {
      return false;
    },
    approverCanApprove() {
      return false;
    }
  },
  methods: {
    downloadFile(fileName, type) {
      this.$store.dispatch('deals/downloadFile', {
        filename: fileName,
        dmss: type === 'dmss'
      });
    },
    approvedStatusColor(state) {
      if (state === 'approved') return 'greenLight';
      if (state === 'rejected') return 'orange';
      return 'grey';
    }
  }
};
</script>
