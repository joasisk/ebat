<template>
  <v-expansion-panels v-if="isColumnSelected && !preview" multiple accordion>
    <v-expansion-panel>
      <v-expansion-panel-header color="deepPurple2">
        Column Configuration
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3">
        <v-text-field
          v-debounce="updateColName"
          label="Column name"
          dense
          outlined
          class="mt-2"
          :value="column.title"
        />

        <v-select
          label="Column width"
          dense
          outlined
          :items="widths"
          :value="column.width"
          @change="value => $store.dispatch('form/updateColumnWidth', value)"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-header color="deepPurple2">
        Access Configuration
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3">
        <v-select
          label="Column access"
          dense
          outlined
          multiple
          item-text="role"
          item-value="role_id"
          class="mt-2"
          :items="configRoles"
          :value="column.access"
          @change="value => $store.dispatch('form/updateColumnAccess', value)"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>

    <!-- remove column -->
    <v-expansion-panel>
      <v-expansion-panel-header color="deepOrange2">
        Remove column
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepOrange3">
        <p>Please be aware that this action can have severe consequences</p>
        <p
          v-if="column.questions.length > 0 || column.table.hasTable"
          color="error"
        >
          You need to remove column content
        </p>
        <v-btn
          type="danger"
          :disabled="column.questions.length > 0 || column.table.hasTable"
          @click="deleteClick"
        >
          Delete column
        </v-btn>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import QuestionMixin from '@/mixins/question.mixin';
import { ROLES } from '@/config/roles.js';
import { mapState } from 'vuex';

export default {
  name: 'ColumnProperties',
  mixins: [QuestionMixin],

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
      preview: state => state.form.preview,
      isColumnSelected: state => state.form.isColumnSelected,
      column: state =>
        state.form.form.rows[state.form.rowIndex].columns[state.form.colIndex]
    }),
    configRoles() {
      return ROLES.reduce((r, g) => {
        return g.role !== 'none' ? [...r, g] : r;
      }, []);
    }
  },

  methods: {
    deleteClick() {
      this.$store.dispatch('form/deleteColumn');
    },
    updateColName(value) {
      const newVal =
        value == '' ? 'tempQvalueLabel' : this.generateValueName(value);
      this.$store.dispatch('form/updateColumnValue', {
        oldVal: this.column.comments,
        newVal
      });
      this.$store.dispatch('form/updateColumnTitle', value);
    }
  }
};
</script>
