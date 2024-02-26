<template>
  <v-expansion-panels v-if="show && !preview" multiple accordion>
    <v-expansion-panel>
      <v-expansion-panel-header color="deepPurple2">
        Section Question Configuration
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3" class="pt-4">
        <v-text-field
          v-debounce="updateValue"
          dense
          label="Section Title"
          outlined
          :value="section.title"
        />
        <v-number-input
          v-debounce="
            v => $store.dispatch('form/updateSectionCount', parseInt(v))
          "
          label="Max allowed number of sections"
          :whole-number="true"
          :value="'' + section.maxCount"
        />
        <v-checkbox
          dense
          label="Section has textarea"
          :input-value="section.hasText"
          @change="$store.dispatch('form/toggleSectionHasText')"
        />
        <v-checkbox
          dense
          label="Section has file attachment"
          :input-value="section.hasFile"
          @change="$store.dispatch('form/toggleSectionHasFile')"
        />
        <v-checkbox
          dense
          label="Section has Comments"
          :input-value="section.hasText"
          @change="$store.dispatch('form/toggleSectionHasComments')"
        />
        <v-checkbox
          dense
          label="Section requires Approval"
          :input-value="section.hasText"
          @change="$store.dispatch('form/toggleSectionRequiresApproval')"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>

    <!-- remove section -->
    <v-expansion-panel>
      <v-expansion-panel-header color="deepOrange2">
        Remove Section Question
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepOrange3">
        <p>Please be aware that this action can have severe consequences.</p>
        <v-btn type="danger" @click="deleteClick">Delete Section</v-btn>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import QuestionMixin from '@/mixins/question.mixin';
import { mapState } from 'vuex';
import VNumberInput from '@/components/VNumberInput.vue';

export default {
  name: 'QuestionSectionProperties',
  components: { VNumberInput },
  mixins: [QuestionMixin],

  computed: {
    ...mapState({
      section: state => {
        return state.form.sectionSelected
          ? state.form.form.rows[state.form.rowIndex].questionSection
          : {};
      },
      show: state => state.form.sectionSelected,
      preview: state => state.form.preview
    })
  },

  methods: {
    deleteClick() {
      this.$store.dispatch('form/deletequestionSection');
    },
    updateValue(label) {
      const OLD_V_NAME = this.section.value;
      const NEW_V_NAME =
        label == '' ? 'tempQvalueLabel' : this.generateValueName(label);
      this.$store.dispatch('form/updatequestionSectionLabel', label);
      this.$store.dispatch('form/updatequestionSectionValue', {
        newValueName: NEW_V_NAME,
        oldValueName: OLD_V_NAME
      });
    }
  }
};
</script>
