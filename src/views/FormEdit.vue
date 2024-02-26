<template>
  <div class="form-wrap">
    <form-toolbar
      v-model="tool"
      :disable-question="disableQuestionButton"
      :disable-column="disableColumnButton"
      :disable-table="disableTableButton"
      @save="save"
      @back="cancel"
    />
    <div class="bottom">
      <div class="form" :class="{ 'full-width': preview }">
        <v-container fluid class="pa-0">
          <!-- Add first row btn -->
          <v-row v-show="tool === 'row'" justify="center">
            <v-col cols="1">
              <v-btn color="green" fab x-small @click="addRow">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <row
            v-for="(row, rowIndex) in form.rows"
            :key="'row' + rowIndex"
            :row-index="rowIndex"
            :column-number="row.columns.length"
            :tool="tool"
          >
            <column
              v-for="(col, colIndex) in row.columns"
              :key="`${rowIndex}-col-${colIndex}`"
              :row-index="rowIndex"
              :col-index="colIndex"
              :col-title.sync="col.title"
              :col-width.sync="col.width"
              :has-table="col.table.hasTable"
              :col-table.sync="col.table"
              :col-access.sync="col.access"
              :tool="tool"
              :columns-number="row.columns.length"
              :questions-number="col.questions.length"
              :preview="preview"
            >
              <template v-if="col.table.hasTable">
                <table-question
                  :table-headers="col.table.headers"
                  :preview="preview"
                  :row-index="rowIndex"
                  :col-index="colIndex"
                  :searchable="col.table.searchable"
                  :sortable="col.table.sortable"
                  :has-line-actions="
                    col.table.entryEditable || col.table.entryRemovable
                  "
                />
                <table-overlay :overlay-key="col.table.rows">
                  <question
                    v-for="(q, index) in form.overlays[col.table.rows]
                      .questions"
                    :key="col.table.rows + 'overlay' + q.label"
                    :question="q"
                    :overlay="col.table.rows"
                    :question-index="index"
                  />
                </table-overlay>
              </template>
              <template v-else>
                <question
                  v-for="(q, questionIndex) in col.questions"
                  :key="`question-${rowIndex}-${colIndex}-${questionIndex}`"
                  :question="q"
                  :tool="tool"
                  :row-index="rowIndex"
                  :col-index="colIndex"
                  :question-index="questionIndex"
                />
              </template>
            </column>
            <question-section
              v-if="row.questionSection"
              :row-index="rowIndex"
            />
          </row>
        </v-container>
      </div>

      <!-- config -->
      <aside v-if="!preview">
        <form-json v-if="showDebug" :form="form" />
        <question-properties />
        <table-properties />
        <column-properties />
        <question-section-properties />
      </aside>
    </div>
  </div>
</template>

<script>
import FormToolbar from '@/components/formEdit/_/FormToolbar';
import FormJson from '@/components/formEdit/_/FormJson';
import QuestionProperties from '@/components/formEdit/_/QuestionProperties';
import Row from '@/components/formEdit/Row';
import Column from '@/components/formEdit/Column.vue';
import Question from '@/components/formEdit/Question';
import TableProperties from '@/components/formEdit/_/TableProperties.vue';
import TableQuestion from '@/components/formEdit/TableQuestion.vue';
import ColumnProperties from '@/components/formEdit/_/ColumnProperties.vue';
import TableOverlay from '@/components/formEdit/TableOverlay.vue';
import QuestionSectionProperties from '@/components/formEdit/_/QuestionSectionProperties.vue';
import QuestionSection from '@/components/formEdit/QuestionSection.vue';

import Generators from './../mixins/generators.mixin';
import QuestionMixin from './../mixins/question.mixin';

// import FORM from '@/tmp/newForm.json';
import { mapState } from 'vuex';

export default {
  name: 'FormEdit',
  components: {
    FormToolbar,
    FormJson,
    QuestionProperties,
    Row,
    Column,
    Question,
    TableProperties,
    TableQuestion,
    ColumnProperties,
    TableOverlay,
    QuestionSectionProperties,
    QuestionSection
  },
  mixins: [Generators, QuestionMixin],
  data: () => ({
    debug: true
  }),

  computed: {
    ...mapState({
      tool: state => state.form.tool,
      form: state => state.form.form,
      rowIndex: state => state.form.rowIndex,
      preview: state => state.form.preview
    }),
    disableQuestionButton() {
      if (!this.form.rows || this.loading) return true;
      if (this.form.rows.length === 0) return true;
      if (
        this.form.rows.reduce((r, row) => {
          return [...r, ...row.columns];
        }, []).length === 0
      )
        return true;

      return false;
    },
    disableColumnButton() {
      if (!this.form.rows || this.loading) return true;
      return this.form.rows.length === 0;
    },
    disableTableButton() {
      if (!this.form.rows || this.loading) return true;
      if (this.form.rows.length === 0) return true;
      if (
        this.form.rows.reduce((r, row) => {
          return [
            ...r,
            ...row.columns.filter(column => {
              return column.questions.length == 0;
            })
          ];
        }, []).length === 0
      )
        return true;

      return false;
    },
    showDebug() {
      return (
        this.rowIndex == null &&
        this.preview == false &&
        process.env.VUE_APP_SHOW_DEBUG
      );
    }
  },

  mounted() {
    this.$store.dispatch('form/getForm');
  },

  methods: {
    addRow() {
      this.$store.dispatch('form/addRow', 0);
    },
    save() {
      this.$store.dispatch('form/saveForm', this.form);
      this.$router.push('/');
    },
    cancel() {
      this.$router.go(-1);
    }
  }
};
</script>

<style lang="scss" scoped>
.emptyRow {
  border-top: 1px grey solid;
  border-bottom: 1px grey solid;
  min-height: 3rem;
}

.form-wrap {
  padding-left: 1rem;

  .bottom {
    display: flex;
    flex-flow: row nowrap;
    margin-top: 2.5rem;

    .form {
      min-width: 75%;
      padding-right: 0.75rem;
      &.full-width {
        width: 100%;
        padding-right: 0;
      }
    }

    aside {
      width: 24%;
      height: calc(100vh - 5rem);
      overflow-y: auto;
      position: fixed;
      right: 0.75rem;
    }
  }
}
</style>
