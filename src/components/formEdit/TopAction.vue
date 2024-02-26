<template>
  <v-speed-dial top right open-on-hover absolute direction="left">
    <template v-slot:activator>
      <v-btn fab top right :color="topAction.color" :small="topAction.small">
        <v-icon>{{ topAction.icon }}</v-icon>
      </v-btn>
    </template>
    <v-btn
      v-for="(action, index) in topAction.actions"
      :id="`${action.click.overlay}-toggle`"
      :key="tableName + 'action' + index"
      :color="action.color"
      :small="action.small"
      :fab="action.fab"
      :rounded="action.rounded"
      @click="
        $store.dispatch('form/setOverlayOpenState', {
          overlay: action.click.overlay,
          open: true
        })
      "
    >
      <v-icon left>{{ action.icon }}</v-icon>
      {{ action.text }}
    </v-btn>
  </v-speed-dial>
</template>

<script>
export default {
  name: 'TopAction',
  props: {
    topAction: {
      type: Object,
      required: true
    },
    tableName: {
      type: String,
      required: true
    }
  }
};
</script>
