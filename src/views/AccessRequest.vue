<template>
  <v-container fluid class="pt-1">
    <v-row>
      <v-col>
        <v-card v-if="pendingRequest">
          <v-card-title>Your access request is pending</v-card-title>
          <v-card-subtitle
            >Your access request is being reviewed. Please wait until you will
            get an access!</v-card-subtitle
          >
        </v-card>
        <v-card v-else :loading="loadingRequest">
          <v-card-title>Access request</v-card-title>
          <template v-if="!submitted">
            <v-card-subtitle v-if="userRole === 'none'">
              Currently you have no role.
            </v-card-subtitle>
            <v-container fluid class="pt-0 ma-0">
              <v-row>
                <v-col cols="5">
                  <h3>Current role and access rights</h3>
                  <p>
                    You are logged in as
                    <strong>{{ fullName }}</strong>
                    with role of {{ userRole }}
                    <span
                      v-if="userRole !== 'Admin' && userRole !== 'SysAdmin'"
                    >
                      under GEO<span v-if="userGEO.length > 1">s</span>
                      <span v-for="(item, index) in userGEO" :key="index">
                        {{ getGeoName(item) }}
                        {{ index !== userGEO.length - 1 ? ',' : '' }}
                      </span>
                      <span
                        v-if="
                          userRole !== 'Admin' &&
                            userRole !== 'SysAdmin' &&
                            userMarkets.length > 0
                        "
                      >
                        and
                        <span v-for="(item, index) in userMarkets" :key="index">
                          {{ getMarketName(item) }}
                          {{ index !== userMarkets.length - 1 ? ',' : '' }}
                        </span>
                        Market<span v-if="userMarkets.length > 1">s</span>
                      </span>
                    </span>
                    .
                  </p>
                </v-col>
                <v-col>
                  <v-select
                    v-model="role"
                    autofocus
                    label="Role"
                    outlined
                    dense
                    item-text="role"
                    item-value="role_id"
                    :items="
                      roles.reduce((arr, i) => {
                        return i.role !== 'none' ? [...arr, i] : arr;
                      }, [])
                    "
                  />
                  <v-select
                    v-show="role && role !== 7 && role !== 10"
                    v-model="l_geos"
                    label="GEO"
                    outlined
                    dense
                    item-text="text"
                    item-value="value"
                    multiple
                    chips
                    :items="geoOptions"
                  >
                    <template v-if="geoOptions.length > 0" v-slot:prepend-item>
                      <v-list-item ripple @click="toggleAllGEO">
                        <v-list-item-action>
                          <v-icon>
                            {{ icon_geos }}
                          </v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                          <v-list-item-title>
                            Select All
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-divider class="mt-2"></v-divider>
                    </template>
                    <template #selection="{ item }">
                      <v-chip class="ma-2">
                        {{ item.text }}
                      </v-chip>
                    </template>
                  </v-select>
                  <v-select
                    v-show="role && role !== 7 && role !== 10"
                    v-model="l_markets"
                    :disabled="l_geos.length === 0"
                    chips
                    label="Market"
                    outlined
                    dense
                    multiple
                    :items="marketOptions"
                  >
                    <template
                      v-if="marketOptions.length > 0"
                      v-slot:prepend-item
                    >
                      <v-list-item ripple @click="toggleAllMarkets">
                        <v-list-item-content>
                          <v-list-item-title>
                            Select All
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-divider class="mt-2"></v-divider>
                    </template>
                    <template #selection="{ item }">
                      <v-chip class="ma-2">
                        {{ item.text }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-container>
            <v-card-actions>
              <v-spacer />
              <v-btn
                primary
                color="green"
                :disabled="!enableSubmit"
                @click="requestAccess"
              >
                Request {{ userRole !== 'none' ? 'Edit' : '' }} Access
              </v-btn>
            </v-card-actions>
          </template>
          <template v-else>
            <v-card-text>
              <p>
                Your request for access on email:
                <strong>{{ email }}</strong> for role of
                <strong>{{ role }}</strong> for
                <strong>{{ l_geos + ' ' + l_markets }}</strong> has been placed
                and will be reviewed.
              </p>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="userRole !== 'none'">
      <v-col>
        <v-card>
          <v-card-title><h4>Revoke own access</h4></v-card-title>
          <v-container fluid class="pt-0 ma-0">
            <p>
              This action is permanent and new access would have to be required.
            </p>
          </v-container>
          <v-card-actions>
            <v-spacer />
            <v-btn primary color="red" @click="revokeAccessDialog = true">
              Revoke access
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="revokeAccessDialog" persistent width="505px">
      <v-card>
        <v-card-title>
          <h4>Do you really want to revoke your current access?</h4>
        </v-card-title>
        <v-card-text>
          <v-textarea v-model="justification" label="Justification" dense />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click.stop="hideDialog">Cancel</v-btn>
          <v-btn color="red" text @click.stop="revokeAccess">
            Yes - revoke access
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import validationMixin from '@/mixins/validation.mixin';
import { ROLES } from '@/config/roles';
import { mapState, mapGetters } from 'vuex';
// import { auth_service } from '@/services/auth.service';
export default {
  name: 'AccessRequest',

  mixins: [validationMixin],

  data: () => ({
    roles: ROLES,
    role: 0,
    l_geos: [],
    l_markets: [],
    filteredMarkets: [],
    errorMessages: '',
    revokeAccessDialog: false,
    justification: ''
  }),

  computed: {
    ...mapState({
      pendingRequest: state => state.user.user_state === 1,
      userGEO: state => state.user.geo,
      userMarkets: state => state.user.market,
      userRole: state => state.user.role,
      geos: state => state.geos.geos,
      markets: state => state.markets.markets,
      userGivenName: state => state.user.name,
      userLastName: state => state.user.surname,
      userPrimaryEmail: state => state.user.primary,
      userSecondaryEmail: state => state.user.secondary,
      userId: state => state.user.user_id,
      userState: state => state.user.user_state,
      submitted: state => state.accesses.submitted,
      loadingRequest: state => state.accesses.loading
    }),
    ...mapGetters('user', {
      fullName: 'getFullName'
    }),
    enableSubmit() {
      if (
        this.role !== 7 &&
        this.role !== 10 &&
        this.l_markets.length !== 0 &&
        this.l_geos.length !== 0
      )
        return true;
      if (this.role === 7 || this.role === 10) return true;
      return false;
    },
    geoOptions() {
      return this.geos.reduce((r, g) => {
        return !g.is_disabled ? [...r, { text: g.name, value: g.geo_id }] : r;
      }, []);
    },
    marketOptions() {
      return this.filteredMarkets.reduce((r, m) => {
        return !m.is_disabled
          ? [...r, { text: m.name, value: m.market_id }]
          : r;
      }, []);
    },
    icon_geos() {
      if (this.l_geos.length === this.geoOptions.length) return 'mdi-close-box';
      if (this.l_geos.length > 0) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
    icon_markets() {
      if (this.l_markets.length === this.marketOptions.length)
        return 'mdi-close-box';
      if (this.l_markets.length > 0) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    }
  },

  watch: {
    userGEO: {
      deep: true,
      handler(geo) {
        this.l_geos = geo;
      }
    },
    userMarkets: {
      deep: true,
      handler(markets) {
        this.l_markets = markets;
      }
    },
    userRole: {
      deep: true,
      handler(role) {
        this.role = role;
      }
    },
    l_geos: {
      deep: true,
      handler() {
        this.filteredMarkets = this.markets.filter(e =>
          this.l_geos.some(geo => geo === e.geo_id)
        );
        this.l_markets = [];
      }
    },
    role() {
      this.l_geos = [];
      this.l_markets = [];
    }
  },

  mounted() {
    if (this.geos.length < 1) {
      this.$store.dispatch('geos/getAllGeos');
    }
    if (this.markets.length < 1) {
      this.$store.dispatch('markets/getAllMarkets');
    }
  },

  methods: {
    getMarketName(id) {
      const mar = this.markets.filter(i => i.market_id === id)[0];
      if (mar) return mar.name;
    },
    getGeoName(id) {
      const geo = this.geos.filter(i => i.geo_id === id)[0];
      if (geo) return geo.name;
    },
    hideDialog() {
      this.revokeAccessDialog = false;
      this.justification = '';
    },
    revokeAccess() {
      this.$store.dispatch('accesses/revokeAccess', {
        user_id: this.userId,
        justification: this.justification
      });
      this.revokeAccessDialog = false;
    },
    requestAccess() {
      let tmp = {
        given_name: this.userGivenName,
        last_name: this.userLastName,
        primary_email: this.userPrimaryEmail,
        secondary_email: this.userSecondaryEmail,
        given_role: this.role,
        geo: this.l_geos,
        markets: this.l_markets
      };
      if (this.userRole === 'none')
        this.$store.dispatch('accesses/addAccess', {
          data: tmp,
          userState: this.userState
        });
      else this.$store.dispatch('accesses/updateAccess', tmp);
    },
    toggleAllGEO() {
      if (this.l_geos.length === this.geoOptions.length) {
        this.l_geos = [];
      } else {
        this.l_geos = this.geoOptions.reduce((acc, geo) => {
          acc.push(geo.value);
          return acc;
        }, []);
      }
    },
    toggleAllMarkets() {
      if (this.l_markets.length === this.marketOptions.length) {
        this.l_markets = [];
      } else {
        this.l_markets = this.marketOptions.reduce((acc, market) => {
          acc.push(market.value);
          return acc;
        }, []);
      }
    }
  }
};
</script>
