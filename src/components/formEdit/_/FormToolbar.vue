<template>
  <div id="toolbar">
    <v-card color="toolbar">
      <v-container fluid pt-0 pb-0>
        <v-row>
          <v-btn
            icon
            tile
            :color="tool === 'row' ? 'orange' : 'white'"
            @click="setFormTool('row')"
          >
            <v-icon>mdi-view-day</v-icon>
          </v-btn>
          <v-btn
            icon
            tile
            :color="tool === 'col' ? 'orange' : 'white'"
            :disabled="disableColumn"
            @click="setFormTool('col')"
          >
            <v-icon>mdi-view-grid-plus</v-icon>
          </v-btn>
          <v-btn
            icon
            tile
            :color="tool === 'q' ? 'orange' : 'white'"
            :disabled="disableQuestion"
            @click="setFormTool('q')"
          >
            <v-icon>mdi-comment-plus</v-icon>
          </v-btn>
          <v-btn
            icon
            tile
            :color="tool === 'table' ? 'orange' : 'white'"
            :disabled="disableTable"
            @click="setFormTool('table')"
          >
            <v-icon>mdi-table-plus</v-icon>
          </v-btn>
          <v-btn
            icon
            tile
            :color="tool === 'questionSection' ? 'orange' : 'white'"
            :disabled="disableQuestionSection"
            @click="setFormTool('questionSection')"
          >
            <v-icon>mdi-plus-circle-multiple</v-icon>
          </v-btn>
          <v-spacer />
          <v-switch
            label="Preview"
            dense
            inset
            hide-details
            class="mt-1 mr-6"
            color="yellow"
            :value="preview"
            @change="$store.dispatch('form/togglePreview')"
          />
          <v-btn tile color="main" @click="$emit('back')">Back</v-btn>
          <v-btn tile color="green" @click="$emit('save')">Save</v-btn>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'FormToolbar',
  props: {
    disableColumn: {
      type: Boolean,
      default: true
    },
    disableQuestion: {
      type: Boolean,
      default: true
    },
    disableTable: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    toolbar: 'toolbar'
  }),
  computed: {
    ...mapState({
      tool: state => state.form.tool,
      preview: state => state.form.preview,
      disableQuestionSection: state =>
        !state.form.form.rows.some(r => r.columns.length === 0)
    })
  },
  mounted() {
    this.$store.dispatch('form/resetSelection');
  },
  methods: {
    setFormTool(tool) {
      this.$store.dispatch('form/changeTool', tool);
    }
  }
};
</script>

<style lang="scss">
#toolbar {
  position: sticky;
  top: 16px;
  z-index: 1;
}
</style>
