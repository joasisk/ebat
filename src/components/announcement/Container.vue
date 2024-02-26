<template>
  <v-container
    v-show="announcements.length > 0"
    class="announcementsContainer"
    fluid
    pt-3
  >
    <transition-group name="slide-x-transition">
      <announcement
        v-for="(a, index) in announcements"
        :key="a.id"
        :announcement="a"
        :index="index"
      />
    </transition-group>
  </v-container>
</template>

<script>
import Announcement from './Announcement';
import { mapState } from 'vuex';
export default {
  name: 'Container',
  components: {
    Announcement
  },
  computed: {
    ...mapState({
      announcements: state => state.announcements.announcementsToShow
    })
  }
};
</script>

<style lang="scss" scoped>
.announcementsContainer {
  z-index: 204;
}
</style>
