<template>
  <!-- TODO: -->
  <v-alert :type="announcement.class" outlined prominent>
    <template v-slot:close>
      <v-checkbox
        v-model="notShowAgain"
        label="Do not show again"
        class="checkbox"
      />
      <v-btn small icon dense right @click="remove">
        <v-icon>mdi-close-circle</v-icon>
      </v-btn>
    </template>
    <p>{{ announcement.message }}</p>
  </v-alert>
</template>

<script>
export default {
  name: 'Announcement',
  props: {
    announcement: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    notShowAgain: false
  }),
  methods: {
    remove: function() {
      this.$store.dispatch('announcements/hide', {
        index: this.index,
        notShowAgain: this.notShowAgain,
        id: this.announcement.id
      });
    }
  }
};
</script>

<style lang="scss">
.checkbox {
  min-width: 13rem;
}
p {
  white-space: pre-wrap;
}
</style>
