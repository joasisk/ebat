<template>
  <v-dialog v-model="open" width="50%" @click:outside="deselect">
    <template v-slot:activator="{ on }">
      <v-btn
        small
        absolute
        top
        right
        rounded
        color="main"
        v-on="on"
        @click="deselect"
      >
        open add overlay
      </v-btn>
    </template>
    <v-card>
      <v-toolbar>
        {{ title }}
        <v-spacer />
        <v-btn @click="open = false">close</v-btn>
      </v-toolbar>
      <v-card-text>
        Any change you make here will take affect after saving the document.
      </v-card-text>
      <v-container fluid class="pl-5 pr-5">
        <v-row>
          <v-col>
            <!-- questions go here -->
            <slot />
          </v-col>
          <v-col cols="5">
            <!-- question props go here -->
            <question-properties :disable-name-change="true" />
          </v-col>
        </v-row>
      </v-container>
      <v-divider />
      <v-card-actions>
        <p>Actions will be available in Deal view</p>
        <v-spacer />
        <v-btn
          v-for="action in actions"
          :key="title + '' + action.label"
          disabled
          :color="action.color"
        >
          {{ action.label }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import QuestionProperties from './_/QuestionProperties.vue';

export default {
  name: 'TableOverlay',
  components: { QuestionProperties },
  props: {
    overlayKey: {
      type: String,
      required: true
    }
  },
  data: () => ({
    open: false
  }),
  computed: {
    ...mapState({
      actions(state) {
        return state.form.form.overlays[this.overlayKey].actions;
      },
      title(state) {
        return state.form.form.overlays[this.overlayKey].title;
      }
    })
  },
  methods: {
    deselect() {
      this.$store.dispatch('form/resetSelection');
    }
  }
};
</script>
