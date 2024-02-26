<template>
  <v-container fluid>
    <v-card flat>
      <v-card-title>
        <v-text-field
          v-model="accessSearch"
          label="Search"
          dense
        ></v-text-field>
      </v-card-title>

      <v-data-table
        filterable
        item-key="name"
        sort-by="approval"
        sort-desc
        :loading="loading"
        :headers="accessHeaders"
        :items="usersAndAccesses"
        :search="accessSearch"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip left>
            <template v-slot:activator="{ on }">
              <v-btn
                v-show="enableApprove(item)"
                icon
                small
                color="green"
                v-on="on"
                @click.stop="openDialog(item, 'approve')"
              >
                <v-icon>mdi-check-circle</v-icon>
              </v-btn>
            </template>
            <span>Approve</span>
          </v-tooltip>
          <v-tooltip left>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                small
                color="red"
                v-on="on"
                @click.stop="openDialog(item, 'delete')"
              >
                <v-icon>mdi-delete-circle</v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="showDeleteDialog" width="500px" persistent>
      <v-card>
        <v-card-title>
          <h3>Delete access?</h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="closeDialog('delete')">
            Cancel
          </v-btn>
          <v-btn color="red" text @click="deleteAccess">
            Confirm - delete access
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showApproveDialog" width="500px" persistent>
      <v-card>
        <v-card-title>
          <h3>Approve access?</h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="closeDialog('approve')">
            Cancel
          </v-btn>
          <v-btn color="green" text @click="revokeAccess('false')">
            Approve access
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ROLES } from '@/config/roles';
import accessMixin from '@/mixins/access.mixin';
import { mapState } from 'vuex';
export default {
  name: 'UserManagement',

  mixins: [accessMixin],

  data: () => ({
    showDeleteDialog: false,
    showApproveDialog: false,
    accessHeaders: [
      { text: 'Last name', value: 'last_name' },
      { text: 'Given name', value: 'given_name' },
      { text: 'e-mail', value: 'primary_email' },
      { text: 'GEO', value: 'geoName' },
      { text: 'Market', value: 'marketNames' },
      { text: 'Role', value: 'roleName' },
      { text: 'Approval State', value: 'approval' },
      { text: 'Actions', value: 'actions', sortable: false, filterable: false }
    ],
    accessSearch: '',
    roles: ROLES
  }),

  computed: {
    ...mapState({
      userEmail: state => state.user.primary,
      loadingUsers: state => state.users.loading,
      loadingAccesses: state => state.accesses.loading,
      geos: state => state.geos.geos,
      markets: state => state.markets.markets,
      users: state => state.users.users,
      accesses: state => state.accesses.pendingAccesses
    }),
    loading() {
      return this.loadingUsers || this.loadingAccesses;
    },
    reducedAccesses() {
      return this.accesses.reduce((r, a) => {
        return [
          ...r,
          {
            ...a,
            geoName: this.geos
              .filter(g => {
                if (a.pending_geo)
                  return a.pending_geo.some(pg => g.geo_id === pg);
                return false;
              })
              .map(g => g.name),
            roleName: this.roles
              .filter(g => g.role_id === a.pending_role)
              .map(g => g.role)[0],
            marketNames: this.markets
              .filter(function(item) {
                return a.pending_markets.indexOf(item.market_id) !== -1;
              })
              .map(d => d.name),
            approval: 'Not approved'
          }
        ];
      }, []);
    },
    reducedUsers() {
      return this.users
        .reduce((r, a) => {
          return [
            ...r,
            {
              ...a,
              geoName: this.geos
                .filter(g => {
                  if (a.geo_id.some) {
                    return a.geo_id.some(gi => gi === g.geo_id);
                  }
                  return g.geo_id === a.geo_id;
                })
                .map(g => g.name),
              geo: a.geo_id,
              roleName: this.roles
                .filter(g => g.role_id === a.given_role)
                .map(g => g.role)[0],
              marketNames: this.markets
                .filter(function(item) {
                  return a.markets !== undefined
                    ? a.markets.indexOf(item.market_id) !== -1
                    : '';
                })
                .map(d => d.name),
              approval: 'Approved'
            }
          ];
        }, [])
        .filter(
          e => e.primary_email.toLowerCase() !== this.userEmail.toLowerCase()
        );
    },
    usersAndAccesses() {
      return this.reducedAccesses.concat(this.reducedUsers).map(a => {
        if (a.geoName.join)
          a.geoName = a.given_role === 7 ? 'All' : a.geoName.join(', ');
        if (a.marketNames.join)
          a.marketNames = a.given_role === 7 ? 'All' : a.marketNames.join(', ');
        if (a.geoName.join)
          a.geoName = a.given_role === 7 ? 'All' : a.geoName.join(', ');

        return a;
      });
    },
    reducedRoles() {
      return this.roles.filter(r => r.role != 'none');
    }
  },

  mounted() {
    this.$store.dispatch('accesses/getAllAccessRequest');
    this.$store.dispatch('users/getAllUsers');
    this.$store.dispatch('markets/getAllMarkets');
    this.$store.dispatch('geos/getAllGeos');
  },

  methods: {
    deleteAccess() {
      if (
        this.access.pending_geo !== -1 ||
        this.access.pending_role !== -1 ||
        this.access.pending_markets.length !== 0
      ) {
        this.revokeAccess('true');
      } else {
        this.$store.dispatch('users/disableUser', this.access.user_id);
        this.showDeleteDialog = false;
      }
    },
    enableApprove(item) {
      return item.approval == 'Not approved';
    },
    openDialog(access, type) {
      if (type === 'delete') this.showDeleteDialog = true;
      if (type === 'approve') this.showApproveDialog = true;
      Object.assign(this.access, access);
    },
    closeDialog(type) {
      if (type === 'delete') this.showDeleteDialog = false;
      if (type === 'approve') this.showApproveDialog = false;
      Object.assign(this.access, this.accessEmpty);
    }
  }
};
</script>
