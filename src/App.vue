<template>
  <v-app>
    <the-navigation />
    <notification />
    <socket-status />
    <extend-session />
    <v-main app>
      <v-container fluid class="">
        <announcement />
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import ExtendSession from './components/app/ExtendSession';
import SocketStatus from './components/app/SocketStatus.vue';
import TheNavigation from './components/app/TheNavigation';
import Notification from './components/notification/Container.vue';
import Announcement from './components/announcement/Container.vue';
import { useTheme } from './composables/theme';
const { themeState } = useTheme();
export default {
  name: 'App',

  components: {
    TheNavigation,
    Notification,
    Announcement,
    SocketStatus,
    ExtendSession
  },
  computed: {
    theme() {
      return themeState.theme ?? 'dark';
    }
  },
  watch: {
    theme() {
      this.$vuetify.theme.dark = this.theme == 'dark';
    }
  }
};
</script>

<style lang="scss">
html {
  overflow-y: auto;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
::-webkit-scrollbar-thumb {
  background: rgba(90, 90, 90);
}

.v-input--is-disabled {
  cursor: no-drop;
}
</style>
