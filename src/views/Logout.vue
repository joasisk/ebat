<template>
  <v-row>
    <v-col>
      <h2>You have been successfully logged out.</h2>
      <p class="logInMessage">
        <v-icon>mdi-arrow-left</v-icon>Click login button to get back in.
      </p>
      <iframe class="logoutIframe" :src="one" />
      <iframe class="logoutIframe" :src="two" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Logout',
  data() {
    return {
      one: '',
      two: ''
    };
  },
  mounted() {
    this.$socket.disconnect();
    this.$store.commit('sockets/wipeOnLogout');
    setTimeout(this.addSRC, 500);
  },
  methods: {
    addSRC() {
      this.one = 'https://idaas.iam.ibm.com/pkmslogout';
      const host = window.location.origin;
      if (host.includes('lola.dal1a.cirrus.ibm.com')) {
        this.two = 'https://login.ibm.com/pkmslogout';
      } else {
        this.two = 'https://preprod.login.w3.ibm.com/pkmslogout';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.logoutIframe {
  display: none;
}
.logInMessage {
  position: relative;
  top: 11.5rem;
}
</style>
