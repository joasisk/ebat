<template>
  <v-expansion-panels v-if="show && !preview" multiple accordion>
    <v-expansion-panel>
      <v-expansion-panel-header color="deepPurple2">
        Question Configuration
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3" class="pt-4">
        <v-text-field
          v-if="!disableNameChange"
          v-debounce="updateValue"
          dense
          label="Question Label"
          outlined
          :value="selectedQuestion.label"
        />
        <v-text-field
          v-debounce="updateHint"
          dense
          outlined
          label="Question hint"
          :value="selectedQuestion.config.hint"
        />
        <v-select
          dense
          hide-details
          label="Question type"
          outlined
          :items="types"
          :value="selectedQuestion.type"
          @change="updateType"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>

    <!-- Select config -->
    <v-expansion-panel v-if="selectedQuestion.type == 'select'">
      <v-expansion-panel-header color="deepPurple2">
        Select Config
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3" class="pt-4">
        <v-switch
          class="mt-1"
          hide-details
          label="Custom Options"
          false-value="managed"
          true-value="custom"
          :value="selectedQuestion.config.select.type"
          @change="value => $store.dispatch('form/updateSelectType', value)"
        >
          <template slot="prepend">
            <p class="pt-1 switch-left">Managed options</p>
          </template>
        </v-switch>
        <template v-if="selectedQuestion.config.select.type === 'custom'">
          <v-text-field
            v-debounce="
              value => $store.dispatch('form/updateSelectItems', value)
            "
            dense
            hint="Split values by ';'"
            label="Values for select"
            outlined
            :value="selectedQuestion.config.select.items"
          ></v-text-field>
        </template>
        <template v-else>
          <v-select
            dense
            label="Managed options"
            outlined
            :items="managedOptions"
            :value="selectedQuestion.config.select.items"
            @change="value => $store.dispatch('form/updateSelectItems', value)"
          />
        </template>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <!-- Autopopulation config -->
    <v-expansion-panel v-if="!overlayQuestionSelected">
      <v-expansion-panel-header color="deepPurple2">
        Autopopulate Config
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3" class="pt-4">
        <v-checkbox
          label="Autopopulate"
          :input-value="selectedQuestion.config.autopopulate.autopopulate"
          @change="$store.dispatch('form/toggleAutopopulate')"
        />
        <autopopulate
          :value="selectedQuestion.config.autopopulate"
          @input="
            value => $store.dispatch('form/updateAutopopulateConfig', value)
          "
        />
      </v-expansion-panel-content>
    </v-expansion-panel>

    <!-- business rules -->
    <v-expansion-panel>
      <v-expansion-panel-header color="deepPurple2">
        Business Rules
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3" class="pt-4">
        <v-checkbox
          label="Required field"
          dense
          :input-value="selectedQuestion.validation.required.required"
          @change="$store.dispatch('form/toggleRequired')"
        />
        <template v-if="selectedQuestion.validation.required.required">
          <v-checkbox
            label="Under the condition"
            dense
            :input-value="selectedQuestion.validation.required.if"
            @change="updateCondition"
          />
          <v-checkbox
            dense
            label="Hide if not required"
            :input-value="selectedQuestion.validation.required.show"
            @change="toggleConditionShow"
          />
          <v-select
            v-if="selectedQuestion.validation.required.if"
            label="That field"
            dense
            outlined
            item-text="text"
            item-value="value"
            :value="selectedQuestion.validation.required.field"
            :items="listOfQuestions"
            @change="updateConditionalField"
          />
          <v-text-field
            v-if="selectedQuestion.validation.required.if"
            v-debounce="updateRequiredValue"
            dense
            hint="If multiple values are valid separate with ';'"
            label="Is of value"
            outlined
            :value="selectedQuestion.validation.required.value"
          />
        </template>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <!-- remove question -->
    <v-expansion-panel v-if="!disableNameChange">
      <v-expansion-panel-header color="deepOrange2">
        Remove question
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepOrange3">
        <p>Please be aware that this action can have severe consequences</p>
        <v-btn type="danger" @click="deleteClick">Delete question</v-btn>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import Autopopulate from './Autopopulate';

import QuestionMixin from '@/mixins/question.mixin';
import { mapState } from 'vuex';

export default {
  name: 'QuestionProperties',
  components: { Autopopulate },
  mixins: [QuestionMixin],
  props: {
    disableNameChange: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    // configs
    managedOptions: ['GEOs', 'Markets', 'Countries', 'Categories', 'Reasons'],
    types: [
      'info',
      'text',
      'number',
      'select',
      'file',
      'text-area',
      'date',
      'checkbox'
    ]
  }),

  computed: {
    ...mapState({
      selectedQuestion: state => {
        if (state.form.rowIndex != null) {
          return state.form.form.rows[state.form.rowIndex].columns[
            state.form.colIndex
          ].questions[state.form.questionIndex];
        }
        return state.form.form.overlays[state.form.selectedOverlay].questions[
          state.form.questionIndex
        ];
      },
      show: state => state.form.questionIndex != null,
      preview: state => state.form.preview,
      overlayQuestionSelected: state => state.form.selectedOverlay != '',
      listOfQuestions: state => {
        return state.form.form.rows.reduce((rowResult, row) => {
          return [
            ...rowResult,
            ...row.columns.reduce((colResult, col) => {
              return [
                ...colResult,
                ...col.questions.reduce((qResult, question) => {
                  if (
                    question.label !==
                    state.form.form.rows[state.form.rowIndex].columns[
                      state.form.colIndex
                    ].questions[state.form.questionIndex].label
                  ) {
                    qResult.push({
                      text: question.label,
                      value: question.value
                    });
                  }
                  return qResult;
                }, [])
              ];
            }, [])
          ];
        }, []);
      }
    })
  },

  methods: {
    deleteClick() {
      this.$store.dispatch('form/deleteQuestion');
    },
    updateValue(label) {
      const OLD_V_NAME = this.selectedQuestion.value;
      const NEW_V_NAME =
        label == '' ? 'tempQvalueLabel' : this.generateValueName(label);
      this.$store.dispatch('form/updateQuestionLabel', label);
      this.$store.dispatch('form/updateValue', {
        newValueName: NEW_V_NAME,
        oldValueName: OLD_V_NAME,
        isArray: false
      });
    },
    updateType(type) {
      let newEmpty = null;
      switch (type) {
        case 'number':
          newEmpty = 0;
          break;
        case 'checkbox':
          newEmpty = false;
          break;
        case 'file':
          newEmpty = [];
          break;
        default:
          newEmpty = '';
          break;
      }
      this.$store.dispatch('form/updateQuestionType', {
        type: type,
        empty: newEmpty,
        value: this.selectedQuestion.value
      });
    },
    updateCondition() {
      this.$store.dispatch('form/updateRequiredIf');
    },
    updateConditionalField(field) {
      this.$store.dispatch('form/updateRequiredIfField', field);
    },
    updateRequiredValue(value) {
      this.$store.dispatch('form/updateRequiredValue', value);
    },
    toggleConditionShow() {
      this.$store.dispatch('form/toggleConditionShow');
    },
    updateHint(value) {
      this.$store.dispatch('form/updateHint', value);
    }
  }
};
</script>
