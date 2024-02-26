<template>
  <v-container
    fluid
    class="pa-0"
    :class="{
      'mt-6': showPlaceholder,
      'mb-6': showPlaceholder
    }"
  >
    <v-divider v-if="showPlaceholder" />
    <v-row
      :class="{
        emptyRow: isEmpty
      }"
    >
      <v-card v-if="showPlaceholder">
        Empty Row
      </v-card>
      <!-- add first col for row btn -->
      <v-col
        v-show="tool === 'col' || tool === 'questionSection'"
        cols="auto"
        align-self="center"
        class="col-add-col"
      >
        <v-btn
          v-show="tool === 'col'"
          color="green"
          fab
          x-small
          class="col-add-button"
          @click="addCol"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn
          v-show="tool === 'questionSection' && columnNumber === 0"
          color="green"
          fab
          x-small
          @click="addquestionSection"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
      <slot></slot>
    </v-row>
    <!-- add row after -->
    <v-row
      v-show="tool === 'row'"
      :key="`row-add-${rowIndex}`"
      justify="center"
    >
      <v-col cols="1">
        <v-btn color="green" fab x-small @click="addRow">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'Row',
  props: {
    rowIndex: {
      required: true,
      type: Number
    },
    columnNumber: {
      required: true,
      type: Number,
      default: 0
    },
    tool: {
      required: true,
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState({
      questionSection(state) {
        return state.form.form.rows[this.rowIndex].questionSection;
      }
    }),
    isEmpty() {
      return this.columnNumber === 0 && this.questionSection == null;
    },
    showPlaceholder() {
      return (
        this.isEmpty && this.tool !== 'col' && this.tool !== 'questionSection'
      );
    }
  },
  methods: {
    addRow() {
      this.$store.dispatch('form/addRow', this.rowIndex + 1);
    },
    addCol() {
      this.$store.dispatch('form/addCol', { ri: this.rowIndex, ci: 0 });
    },
    addquestionSection() {
      this.$store.dispatch('form/addquestionSection', this.rowIndex);
    }
  }
};
</script>
<style lang="scss" scoped>
.row.emptyRow {
  justify-content: center;
}
</style>
