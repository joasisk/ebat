<template>
  <v-dialog v-model="showLogoutWarning" persistent width="500">
    <v-card>
      <v-card-title>You are about to be logged out!</v-card-title>
      <v-card-text>
        If you do not take action, You will be logged out within next 15
        minutes!
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="logout">OK. Log me out now.</v-btn>
        <v-btn color="primary" text @click="extendSession"
          >Extend the Session!</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import { auth_service } from '@/services/auth.service';
export default {
  name: 'ExtendSession',
  computed: {
    ...mapState({
      showLogoutWarning: state => state.user.showLogoutWarning,
      renewLoading: state => state.user.loading
    })
  },
  methods: {
    extendSession() {
      auth_service.extendSession();
    },
    logout() {
      auth_service.logout();
    }
  }
};
</script>
