<template>
  <v-alert :type="notification.severity" dense border="left" colored-border>
    <template v-slot:close>
      <v-btn color="grey" small icon dense right @click="remove">
        <v-icon>mdi-close-circle</v-icon>
      </v-btn>
    </template>
    <h3>{{ notification.title }}</h3>
    <h4>{{ notification.subtitle }}</h4>
    {{ notification.caption }}
  </v-alert>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    notification: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  methods: {
    remove: function() {
      this.$store.dispatch('notifications/removeNotification', this.index);
    }
  }
};
</script>
