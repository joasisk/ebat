<template>
  <div>
    <div
      v-if="question.type != 'checkbox'"
      :class="questionClass"
      class="mt-3 mb-3 pa-2 pl-3 pr-3 outlined"
      @click="selectQuestion"
    >
      <span>{{ question.label }}</span>
      <span v-if="showHint" class="hint">{{ question.config.hint }}</span>
      <v-icon>{{
        question.type === 'select'
          ? 'mdi-menu-down'
          : question.type === 'date'
          ? 'mdi-calendar-edit'
          : ''
      }}</v-icon>
    </div>
    <div
      v-else
      class="maxHeight"
      :class="questionClass"
      @click="selectQuestion"
    >
      <v-checkbox
        disabled
        :label="question.label"
        :hint="question.config.hint"
      />
    </div>
    <v-btn
      v-if="tool === 'q'"
      color="green"
      fab
      x-small
      class="add-question-button"
      @click="addQuestion"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'Question',

  props: {
    question: {
      type: Object,
      default: () => ({
        type: 'text',
        label: 'New Question',
        value: 'questionValue',
        validation: [
          {
            type: 'required',
            rule: {
              required: false
            }
          }
        ]
      })
    },
    tool: {
      type: String,
      default: ''
    },
    rowIndex: {
      type: Number,
      default: null
    },
    colIndex: {
      type: Number,
      default: null
    },
    questionIndex: {
      type: Number,
      required: true
    },
    overlay: {
      type: String,
      default: ''
    }
  },

  computed: {
    ...mapState({
      selectedRow: state => state.form.rowIndex,
      selectedCol: state => state.form.colIndex,
      selectedQuestion: state => state.form.questionIndex,
      preview: state => state.form.preview
    }),
    enabledEditing() {
      if (this.question.config && this.question.config.disableEdit)
        return !(this.preview || this.question.config.disableEdit);
      return !this.preview;
    },
    questionClass() {
      let classes = '';
      if (this.selected) classes += 'selected';
      if (!this.enabledEditing) classes += ' disabled';
      if (this.showHint) classes += ' hinted';
      return classes;
    },
    selected() {
      return (
        (this.rowIndex === this.selectedRow &&
          this.colIndex === this.selectedCol &&
          this.questionIndex === this.selectedQuestion) ||
        (this.questionIndex === this.selectQuestion && this.rowIndex === null)
      );
    },
    showHint() {
      if (this.question.config.hint) {
        return this.question.config.hint.length > 0;
      }
      return false;
    }
  },

  methods: {
    selectQuestion() {
      if (this.enabledEditing) {
        if (this.rowIndex != null) {
          this.$store.dispatch('form/chooseQuestion', {
            ri: this.rowIndex,
            ci: this.colIndex,
            qi: this.questionIndex
          });
        } else {
          this.$store.dispatch('form/chooseOverlayQuestion', {
            overlay: this.overlay,
            qi: this.questionIndex
          });
        }
      }
    },
    addQuestion() {
      this.$store.dispatch('form/addQuestion', {
        ri: this.rowIndex,
        ci: this.colIndex,
        qi: this.questionIndex + 1
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.selected {
  border-radius: 4px;
}

p.switch-left {
  color: rgba(255, 255, 255, 0.7);
}

.maxHeight {
  max-height: 2rem;
}

.outlined {
  border-radius: 4px;
  cursor: pointer;
  position: relative;

  &.hinted {
    margin-bottom: 1.5rem !important;
  }
}
.disabled {
  color: grey;
  border-color: grey;
  cursor: no-drop;
}
.add-question-button {
  position: relative;
  left: calc(50% - 16px);
}
.hint {
  position: absolute;
  left: 0.75rem;
  bottom: -1.2rem;
  font-size: 0.75rem;
}
.theme--light {
  .selected {
    box-shadow: inset 0px 0px 10px #fcdd46;
    box-shadow: 0px 0px 10px #fcdd46;
  }
  .outlined {
    border: solid rgba(42, 42, 42, 0.5) 1px;

    &:hover {
      border-color: rgb(20, 20, 20);
    }
  }
  .hint {
    color: rgba(42, 42, 42, 0.5);
  }
}
.theme--dark {
  .selected {
    box-shadow: inset 0px 0px 10px #ffd600;
    box-shadow: 0px 0px 10px #ffd600;
  }
  .outlined {
    border: solid rgba(255, 255, 255, 0.5) 1px;

    &:hover {
      border-color: white;
    }
  }
  .hint {
    color: rgba(255, 255, 255, 0.5);
  }
}
</style>
