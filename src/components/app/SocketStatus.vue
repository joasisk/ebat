<template>
  <div style="position: fixed; bottom: 1rem; left: 1rem; z-index: 100">
    <transition-group name="slide-x-transition">
      <v-card v-for="rq in requests" :key="rq.filename" class="mt-1">
        <v-card-title>{{ rq.filename }}</v-card-title>
        <v-card-subtitle>{{ change(rq.status) }}</v-card-subtitle>
        <v-container>
          <v-progress-linear
            v-model="rq.progress"
            rounded
            height="5"
            buffer-value="0"
            :stream="rq.status === 'U'"
            :indeterminate="rq.status === 'S'"
          />
        </v-container>
      </v-card>
    </transition-group>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'SocketStatus',
  computed: {
    ...mapState({
      email: state => state.user.primary,
      requests: state => state.sockets.requests,
      dealId: state => state.deals.deal._id,
      connected: state => state.sockets.connected
    }),
    socketID() {
      return window.btoa(this.email);
    }
  },
  // watch: { todo
  //   socketID(v) {
  //     if (v !== '' && !this.connected && this.allowedToConnect)
  //       this.$socket.connect();
  //   }
  // },
  sockets: {
    connect() {
      this.$socket.emit('storeClientInfo', { customId: this.socketID });
      this.$store.commit('sockets/updateConnected', true);
    },

    announcements(payload) {
      this.$store.dispatch('announcements/setAnnouncementsToShow', payload);
    },

    disconect() {
      this.$store.commit('sockets/updateConnected', false);
    },
    reportProgress(payload) {
      this.$store.dispatch('sockets/updateBatchProgress', {
        id: payload[1],
        progress: payload[0],
        filename: payload[2]
      });
    },
    status(payload) {
      this.$store.dispatch('sockets/updateBatchProgress', {
        id: payload[1],
        status: payload[0],
        filename: payload[2]
      });
      if (payload[0] === 'C' || payload[0] === 'F' || payload[0] === 'X') {
        setTimeout(
          () =>
            this.$store.dispatch('sockets/removeRQ', {
              id: payload[1],
              filename: payload[2]
            }),
          5000
        );
        if (payload[0] === 'F') {
          this.$store.dispatch(
            'notifications/createNotification',
            {
              title: 'Could not upload the file!',
              subtitle: 'Please try again later',
              severity: 'error'
            },
            { root: true }
          );
        }
        if (payload[0] === 'X') {
          this.$store.dispatch(
            'notifications/createNotification',
            {
              title: 'Excel file is corrupted!',
              subtitle: 'Please, check your file',
              severity: 'error'
            },
            { root: true }
          );
        }
      }
    },
    data(payload) {
      if (this.dealId === payload[1])
        this.$store.dispatch('deals/getDMSSData', this.dealId);
    }
  },
  methods: {
    change(status) {
      switch (status) {
        case 'S':
          return 'Scheduled';
        case 'F':
          return 'Failed';
        case 'U':
          return 'Uploading';
        case 'X':
          return 'File corrupted!';
        case 'C':
          return 'Completed';
        case 'P':
          return 'Processing';
        default:
          break;
      }
    }
  }
};
</script>
