<template>
  <v-container fluid>
    <v-row @click="$store.dispatch('form/selectquestionSection', rowIndex)">
      <v-col>
        <v-card
          color="greyContrast"
          class="pa-0"
          :class="{ selected: selected }"
        >
          <v-card-title>{{ questionSection.title }} 1</v-card-title>
          <v-container>
            <v-textarea
              v-if="questionSection.hasText"
              dense
              disabled
              outlined
              :label="`${questionSection.title} 1 text`"
            />
            <v-file-input
              v-if="questionSection.hasFile"
              dense
              disabled
              outlined
              :label="`${questionSection.title} attachment`"
            />
            <template v-if="questionSection.hasComments">
              <v-divider></v-divider>
              <h4>Section comments</h4>
              <v-textarea
                dense
                disabled
                outlined
                label="Add new Comment"
              ></v-textarea>
            </template>
          </v-container>
        </v-card>
      </v-col>
      <v-col v-if="questionSection.maxCount > 1">
        <v-card color="greyContrast">
          <v-card-title>
            You can add up to
            {{ questionSection.maxCount - 1 }} sections
          </v-card-title>
          <v-container>
            <v-btn disabled>
              Add another {{ questionSection.title }} section
            </v-btn>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'QuestionSection',
  props: {
    rowIndex: {
      type: Number,
      required: true
    }
  },
  computed: {
    ...mapState({
      selectedRow: state => state.form.rowIndex,
      sectionSelected: state => state.form.sectionSelected,
      questionSection(state) {
        return state.form.form.rows[this.rowIndex].questionSection;
      }
    }),
    selected() {
      return this.rowIndex === this.selectedRow && this.sectionSelected;
    }
  }
};
</script>

<style lang="scss" scoped>
.selected {
  box-shadow: inset 0px 0px 10px #ffd600 !important;
  box-shadow: 0px 0px 10px #ffd600 !important;
  border-radius: 4px !important;
}
</style>
