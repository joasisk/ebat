<template>
  <v-container class="pt-4" fluid>
    <v-card>
      <v-card-text>
        Delegated by me
        <v-btn
          id="addBtn"
          color="primary"
          fab
          medium
          absolute
          top
          right
          @click.stop="openDialog({}, 'add')"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-data-table
          :headers="delegatedHeaders"
          :items="delegatedByMe"
          :loading="loadingDelegatedByMe"
          :items-per-page="5"
        >
          <template v-slot:[`item.name`]="{ item }">
            <v-avatar size="2.5rem">
              <v-img v-if="item.image !== 'none'" :src="item.image"></v-img>
            </v-avatar>
            {{ item.given_name + ' ' + item.last_name }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
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
      </v-card-text>
    </v-card>
    <v-card class="mt-2">
      <v-card-text>
        Delegated to me
        <v-data-table
          :headers="delegatedHeaders"
          :items="delegatedToMe"
          :loading="loadingDelegatedToMe"
          :items-per-page="5"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip left>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  small
                  color="red"
                  v-on="on"
                  @click.stop="openDialog(item, 'showDelegateToMeDialog')"
                >
                  <v-icon v-if="canDeleteDelegation(item)"
                    >mdi-delete-circle</v-icon
                  >
                  <v-icon v-else color="main">mdi-pencil-circle</v-icon>
                </v-btn>
              </template>
              <span v-if="canDeleteDelegation(item)">Delete</span>
              <span v-else>Edit</span>
            </v-tooltip>
          </template>
          <template v-slot:[`item.name`]="{ item }">
            <v-avatar size="2.5rem">
              <v-img v-if="item.image !== 'none'" :src="item.image"></v-img>
            </v-avatar>
            {{ item.given_name + ' ' + item.last_name }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showDeleteDialog" width="500px" persistent>
      <v-card>
        <v-card-title>
          Delete delegation?
        </v-card-title>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="closeDialog('delete')">
            Cancel
          </v-btn>
          <v-btn color="red" text @click="deleteDelegationByMe">
            Confirm - delete delegation
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDelegateToMeDialog" width="500px" persistent>
      <v-card>
        <v-card-title>
          Delete delegation to me?
        </v-card-title>
        <v-card-text v-show="!canDeleteDelegation(delegatedUser)">
          You have to set another delegate for user.
          <v-select
            v-model="delegateDelete"
            item-value="primary_email"
            item-text="primary_email"
            label="Delegate user"
            color="main"
            dense
            outlined
            :items="delegateCandidatesDelete"
            :loading="loadingCandidates"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="closeDialog('showDelegateToMeDialog')"
          >
            Cancel
          </v-btn>
          <v-btn
            color="red"
            text
            :disabled="deleteButtonDisabled()"
            @click="deleteDelegationToMe"
          >
            Confirm - delete delegation
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addOverlay" persistent>
      <v-card class="mt-2">
        <v-card-title>
          Access Delegation
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="delegate"
            item-value="user_id"
            item-text="primary_email"
            label="Delegate user"
            no-data-text="There are no users for you to delegate"
            color="main"
            dense
            outlined
            :items="delegateCandidates"
            :loading="loadingCandidates"
            :disabled="loadingAdd"
          />
          <v-menu
            v-model="menuDate"
            transition="scale-transition"
            min-width="auto"
            offset-y
            :close-on-content-click="false"
            :nudge-right="40"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateRange"
                v-bind="attrs"
                label="Delegation duration"
                prepend-icon="mdi-calendar"
                readonly
                outlined
                dense
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="dateRange"
              color="main"
              range
              :min="today"
              :disabled="loadingAdd"
            />
          </v-menu>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" text @click="closeDialog('add')">
              Cancel
            </v-btn>
            <v-btn
              color="main"
              :disabled="disableSubmit"
              :loading="loadingAdd"
              @click="setDelegate"
            >
              Submit
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'AccessDelegation',

  data() {
    return {
      showDeleteDialog: false,
      showDelegateToMeDialog: false,
      delegate: '',
      delegateDelete: '',
      delegatedUser: { primary_email: '' },
      dateRange: [],
      delegatedHeaders: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'primary_email' },
        { text: 'From', value: 'startDate' },
        { text: 'To', value: 'endDate' },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          filterable: false
        }
      ],
      addOverlay: false,
      menuDate: false
    };
  },
  computed: {
    ...mapState({
      userId: state => state.user.user_id,
      loadingAdd: state => state.delegation.loadingAdding,
      loadingCandidates: state => state.delegation.loadingCandidates,
      loadingDelegatedByMe: state => state.delegation.loadingDelegatedByMe,
      loadingDelegatedToMe: state => state.delegation.loadingDelegatedToMe,
      delegateCandidates: state => state.delegation.delegateCandidates,
      delegatedByMe: state => state.delegation.delegatedByMe,
      delegatedToMe: state => state.delegation.delegatedToMe,
      usersLoading: state => state.users.loading
    }),
    today() {
      var date = new Date();
      var month =
        date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1;
      var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      var today = date.getFullYear() + '-' + month + '-' + day;
      return today;
    },
    disableSubmit() {
      if (this.dateRange.length > 0 && this.delegate !== '') return false;
      else return true;
    },
    delegateCandidatesDelete() {
      return this.delegateCandidates.filter(
        e => e.primary_email !== this.delegatedUser.primary_email
      );
    }
  },
  mounted() {
    this.$store.dispatch('delegation/getDelegatedToMe', this.userId);
    this.$store.dispatch('delegation/getDelegatedByMe', this.userId);
    this.$store.dispatch('delegation/getPossibleDelegates', this.userId);
  },
  methods: {
    canDeleteDelegation(item) {
      var itemDate = new Date(item.startDate);
      var today = new Date(this.today);
      if (today < itemDate) return true;
      else return false;
    },

    setDelegate() {
      this.dateRange = this.dateRange.sort();
      this.$store
        .dispatch('delegation/addDelegate', {
          data: {
            ids: [this.delegate],
            startDate: this.dateRange[0],
            endDate: this.dateRange[1] ? this.dateRange[1] : this.dateRange[0]
          },
          userId: this.userId
        })
        .then(() => {
          this.dateRange = [];
          this.delegate = '';
          this.addOverlay = false;
        });
    },
    deleteDelegationByMe() {
      this.$store.dispatch('delegation/deleteDelegateByMe', {
        userId: this.userId,
        deleteId: this.delegatedUser.user_id,
        startDate: this.delegatedUser.startDate,
        endDate: this.delegatedUser.endDate
      });
      this.showDeleteDialog = false;
    },
    deleteDelegationToMe() {
      this.$store.dispatch('delegation/deleteDelegateToMe', {
        userId: this.userId,
        email: this.delegatedUser.primary_email,
        successor: this.delegateDelete,
        startDate: this.delegatedUser.startDate,
        endDate: this.delegatedUser.endDate
      });
      this.showDelegateToMeDialog = false;
      setTimeout(() => {
        this.delegateDelete = '';
      }, 100);
    },

    openDialog(item, type) {
      if (type === 'add') return (this.addOverlay = true);
      if (type === 'delete') this.showDeleteDialog = true;
      if (type === 'showDelegateToMeDialog') {
        this.showDelegateToMeDialog = true;
        this.delegateDelete = '';
      }
      Object.assign(this.delegatedUser, item);
      this.delegate = '';
      this.dateRange = [];
    },
    closeDialog(type) {
      if (type === 'add') this.addOverlay = false;
      if (type === 'delete') this.showDeleteDialog = false;
      if (type === 'showDelegateToMeDialog') {
        this.showDelegateToMeDialog = false;
        this.delegateDelete = '';
      }
      this.delegatedUser = { primary_email: '' };
      this.delegate = '';
      this.dateRange = [];
    },
    deleteButtonDisabled() {
      if (this.canDeleteDelegation(this.delegatedUser)) return false;
      if (this.delegateDelete == '') return true;
      return false;
    }
  }
};
</script>

<style scoped>
#addBtn {
  top: 25px;
  right: 25px;
}
</style>
