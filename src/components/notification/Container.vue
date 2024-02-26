<template>
  <div class="notificationsContainer">
    <transition-group name="slide-x-transition">
      <notification
        v-for="(n, index) in notifications"
        :key="n.time"
        :notification="n"
        :index="index"
      />
    </transition-group>
  </div>
</template>

<script>
import Notification from './Notification';
import { mapState } from 'vuex';
export default {
  name: 'Container',
  components: {
    Notification
  },
  computed: {
    ...mapState({
      notifications: state => state.notifications.notifications
    })
  }
};
</script>

<style lang="scss" scoped>
.notificationsContainer {
  display: flex;
  flex-flow: column-reverse;
  position: fixed;
  bottom: 0;
  right: 0.8em;
  z-index: 204;
}
</style>
