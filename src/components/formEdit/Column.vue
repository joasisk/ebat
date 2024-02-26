<template>
  <v-col
    :key="`col-${rowIndex}-${colIndex}`"
    :cols="colWidth"
    :class="{
      'last-col': colIndex + 1 === columnsNumber
    }"
  >
    <v-card color="greyContrast" class="pa-0" :class="{ selected: isSelected }">
      <v-toolbar
        :color="!preview ? 'indigoDark' : 'grey'"
        class="cardToolbar"
        @click="selectCol"
      >
        {{ colTitle }}
      </v-toolbar>
      <v-container>
        <!-- add table -->
        <v-btn
          v-if="tool === 'table' && questionsNumber === 0 && hasTable == false"
          color="green"
          fab
          x-small
          class="add-question-button"
          @click="addTable"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <!-- add q to beginning -->
        <v-btn
          v-if="tool === 'q' && hasTable == false"
          color="green"
          fab
          x-small
          class="add-question-button"
          @click="addQuestion"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <slot></slot>
        <v-divider></v-divider>
        <h4>Form comments</h4>
        <v-textarea
          outlined
          dense
          disabled
          label="Add new Comment"
        ></v-textarea>
      </v-container>
    </v-card>
    <!-- add column behind -->
    <v-btn
      v-show="tool === 'col'"
      color="green"
      fab
      x-small
      class="col-add-button after"
      @click="addCol"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-col>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'Column',
  props: {
    selected: {
      type: Boolean,
      default: false
    },
    rowIndex: {
      type: Number,
      required: true
    },
    colIndex: {
      type: Number,
      required: true
    },
    colTitle: {
      type: String,
      required: true
    },
    colWidth: {
      type: String,
      required: true
    },
    tool: {
      type: String,
      default: ''
    },
    columnsNumber: {
      type: Number,
      required: true
    },
    hasTable: {
      type: Boolean,
      default: false
    },
    preview: {
      type: Boolean,
      default: false
    },
    questionsNumber: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    widths: [
      { text: 'Auto width', value: 'auto' },
      { text: '1/4', value: '3' },
      { text: '1/3', value: '4' },
      { text: '1/2', value: '6' },
      { text: '2/3', value: '8' },
      { text: 'Full width', value: '12' }
    ]
  }),
  computed: {
    ...mapState({
      selectedRowI: state => state.form.rowIndex,
      selectedColI: state => state.form.colIndex,
      isColSelected: state => state.form.isColumnSelected
    }),
    isSelected() {
      return (
        this.rowIndex === this.selectedRowI &&
        this.colIndex === this.selectedColI &&
        this.isColSelected
      );
    }
  },
  methods: {
    addCol() {
      this.$store.dispatch('form/addCol', {
        ri: this.rowIndex,
        ci: this.colIndex + 1
      });
    },
    selectCol() {
      this.$store.dispatch('form/chooseColumn', {
        ri: this.rowIndex,
        ci: this.colIndex
      });
    },
    addTable() {
      this.$store.dispatch('form/addTable', {
        ri: this.rowIndex,
        ci: this.colIndex
      });
    },
    addQuestion() {
      this.$store.dispatch('form/addQuestion', {
        ri: this.rowIndex,
        ci: this.colIndex,
        qi: 0
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.col {
  position: relative;

  .selected {
    box-shadow: inset 0px 0px 10px #ffd600;
    box-shadow: 0px 0px 10px #ffd600;
  }

  .col-add-button {
    position: absolute;
    z-index: 10;

    &.after {
      right: -16px;
      top: calc(50% - 16px);
    }
  }

  &.last-col {
    .col-add-button.after {
      right: 7px;
    }
  }

  &.col-add-col {
    position: absolute;
    padding-left: 0;
    z-index: 10;

    .col-add-button {
      position: initial;
    }
  }
}
.cardToolbar {
  cursor: pointer;
}

.add-question-button {
  position: relative;
  left: calc(50% - 16px);
}
</style>
