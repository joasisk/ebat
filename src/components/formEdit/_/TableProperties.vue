<template>
  <v-expansion-panels v-if="show && !preview" multiple accordion>
    <v-expansion-panel>
      <v-expansion-panel-header color="deepPurple2">
        Table Name & Columns
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3" class="pt-4">
        <v-text-field
          v-debounce="updateTableRows"
          :value="table.rows"
          label="Table Name"
          hint="important for understandable data structure"
          dense
          outlined
        />
        <template v-if="table.headers.length == 0">
          <v-btn @click="addHeader(0)">Add Column</v-btn>
        </template>
        <template v-for="(h, index) in table.headers">
          <v-text-field
            :key="`header-${index}`"
            v-debounce="value => onHeaderChange(value, index)"
            :value="h.text"
            label="Column Name"
            dense
            outlined
            class="column-title"
          >
            <template v-slot:prepend>
              <v-btn fab small @click="addHeader(index)">
                <v-icon>mdi-table-column-plus-before</v-icon>
              </v-btn>
            </template>
            <template v-slot:append-outer>
              <v-btn fab small @click="addHeader(index + 1)">
                <v-icon>mdi-table-column-plus-after</v-icon>
              </v-btn>
            </template>
            <template v-slot:append>
              <v-btn
                fab
                text
                small
                max-width="1.8rem"
                max-height="1.8rem"
                class="centerAppendIcon"
                @click="removeHeader(index)"
              >
                <v-icon class="d-block">mdi-close</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </template>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel>
      <v-expansion-panel-header color="deepPurple2">
        Table Configuration
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3" class="pt-4">
        <v-checkbox
          :input-value="table.searchable"
          label="Searchable"
          dense
          outlined
          @change="$store.dispatch('form/toggleSearchable')"
        />
        <v-checkbox
          :input-value="table.sortable"
          label="Sortable"
          dense
          outlined
          @change="$store.dispatch('form/toggleSortable')"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel>
      <v-expansion-panel-header color="deepPurple2">
        Table Line Actions
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepPurple3" class="pt-4">
        <v-checkbox
          :input-value="table.entryEditable"
          label="Enable line edit"
          @change="$store.dispatch('form/toggleLinEdit')"
        />
        <v-checkbox
          :input-value="table.entryRemovable"
          label="Enable line removal"
          @change="$store.dispatch('form/toggleLineDelete')"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-header color="deepOrange2">
        Remove table
      </v-expansion-panel-header>
      <v-expansion-panel-content color="deepOrange3" class="pt-4">
        <p>Please be aware that this action can have severe consequences</p>
        <v-btn type="danger" @click="deleteClick">Delete table</v-btn>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import valueGenerators from '@/helpers/valueGenerator';
import QuestionMixin from '@/mixins/question.mixin';
import { mapState } from 'vuex';
export default {
  name: 'TableProperties',
  mixins: [QuestionMixin],

  data: () => ({
    nonEmpty: 'tempName'
  }),

  computed: {
    ...mapState({
      show: state => state.form.isTableSelected,
      preview: state => state.form.preview,
      table: state =>
        state.form.form.rows[state.form.rowIndex].columns[state.form.colIndex]
          .table
    })
  },

  methods: {
    updateTableRows(value) {
      this.$store.dispatch('form/updateTableName', value);
    },
    deleteClick() {
      this.$store.dispatch('form/deleteTable');
    },
    onHeaderChange(text, index) {
      const OLD_VALUE_NAME =
        text == '' ? this.nonEmpty : this.table.headers[index].value;
      const NEW_VALUE_NAME = this.generateValueName(text);
      const newHeader = {
        text: text,
        value: NEW_VALUE_NAME
      };

      if (OLD_VALUE_NAME === NEW_VALUE_NAME) return;

      this.$store.dispatch('form/updateTableHeader', {
        index,
        header: newHeader
      });
      this.$store.dispatch('form/updateTableOverlayQuestion', {
        overlay: this.table.rows,
        index,
        header: newHeader,
        oldValueName: OLD_VALUE_NAME
      });
    },
    addHeader(index) {
      const text = 'Column ' + valueGenerators.randstr({ length: 5 });
      const value = this.generateValueName(text);
      const header = { text, value };
      this.$store.dispatch('form/addTableHeader', { header, index });
      this.$store.dispatch('form/addTableOverlayQuestion', {
        overlay: this.table.rows,
        index,
        header
      });
    },
    removeHeader(index) {
      this.$store.dispatch('form/removeTableOverlayQuestion', {
        overlay: this.table.rows,
        index,
        header: this.table.headers[index].value
      });
      this.$store.dispatch('form/removeTableHeader', index);
    }
  }
};
</script>

<style lang="scss">
.column-title {
  div.v-input__prepend-outer,
  div.v-input__append-outer {
    margin-top: 0 !important;
  }
}
.centerAppendIcon {
  margin-top: -0.18rem;
  margin-right: -0.33rem;
}
</style>
