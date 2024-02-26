<template>
  <v-container fluid pt-3>
    <v-row>
      <v-col>
        <v-card class="mt-2">
          <v-card-title>
            <v-layout>
              <v-card-title class="ml-3">
                <span>Deals </span>
              </v-card-title>

              <v-switch
                v-if="showMyOnlySwitch"
                v-model="myOnly"
                :disabled="loadingSearchData || loadingData"
                class="ml-2 mt-4"
                label="Only my deals"
              >
              </v-switch>

              <v-autocomplete
                ref="autocomplete"
                v-model="queryObj"
                chips
                class="ml-5 mr-15"
                dense
                item-value="key"
                item-text="displayValue"
                return-object
                multiple
                :disabled="loadingSearchData || loadingData"
                :loading="loadingSearchData || loadingData"
                :items="searchData"
                :hint="
                  queryObj.length > 0
                    ? 'You can apply opposite value by clicking chip'
                    : ''
                "
                :persistent-hint="queryObj.length > 0"
                @change="autoCompleteChange"
              >
                <template v-slot:selection="data">
                  <v-chip
                    :color="computeColor(data.item.value)"
                    close
                    text-color="black"
                    :disabled="loadingSearchData || loadingData"
                    @click.stop="toggleChip(data.item)"
                    @click:close="removeFromQuery(data.item)"
                  >
                    <strong>{{ searchDataReadable(data.item) }}</strong>
                  </v-chip>
                </template>
                <template v-slot:item="data">
                  {{ data.item.head }}:&nbsp;
                  <strong>{{ data.item.displayValue }}</strong>
                </template>
              </v-autocomplete>
              <v-speed-dial
                v-if="canCreate"
                v-model="toggle"
                absolute
                direction="left"
                open-on-hover
                right
                top
                transition="slide-x-reverse-transition"
                style="z-index:6"
              >
                <template v-slot:activator>
                  <v-btn
                    v-model="toggle"
                    class="dots-horizontal-btn"
                    color="primary"
                    fab
                    large
                    @click="toggle = !toggle"
                  >
                    <v-icon v-if="toggle" color="black">mdi-close</v-icon>
                    <v-icon v-else color="black">mdi-dots-horizontal</v-icon>
                  </v-btn>
                </template>
                <v-btn color="green" light medium rounded @click="createDeal">
                  <v-icon>mdi-plus</v-icon>
                  Create Deal
                </v-btn>
              </v-speed-dial>
            </v-layout>
          </v-card-title>
          <v-data-table
            :headers="showHeaders"
            :items="items"
            :loading="loading"
            dense
            item-key="_id"
            height="87vh"
            fixed-header
            hide-default-footer
            disable-pagination
          >
            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="getColor(item.status)" light>
                <v-tooltip v-if="item.status.includes('br-')" color="cyan" left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon left v-bind="attrs" v-on="on">
                      mdi-record-circle
                    </v-icon>
                  </template>
                  <span>Bid Repair</span>
                </v-tooltip>
                <v-tooltip v-if="item.clonedFrom" color="cyan" left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon left v-bind="attrs" v-on="on">
                      mdi-checkbox-multiple-blank-circle
                    </v-icon>
                  </template>
                  <span>Cloned bid</span>
                </v-tooltip>
                {{ item.status.split('br-').last() }}
              </v-chip>
            </template>
            <template v-slot:[`item._id`]="{ item }">
              {{ item._id.slice(0, 6) }}...
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-btn icon @click="open(item._id)" v-on="on">
                    <v-icon medium>mdi-eye</v-icon>
                  </v-btn>
                </template>
                <span>Open</span>
              </v-tooltip>
            </template>
            <template v-slot:body.append>
              <tr>
                <td colspan="13" style="text-align: center">
                  <v-btn
                    ref="button"
                    class="mt-3 mb-3"
                    color="main"
                    :loading="loading"
                    :disabled="
                      bookmark === 'nil' ||
                        lastFetch === 0 ||
                        lastFetch % limit !== 0
                    "
                    block
                    @click="getData()"
                  >
                    {{
                      bookmark === 'nil' ||
                      lastFetch === 0 ||
                      lastFetch % limit !== 0
                        ? 'No more items to load'
                        : 'Load more'
                    }}
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog_action" width="500">
      <v-card>
        <v-card-title primary-title
          >Do you really want to approve request
        </v-card-title>
        <v-card-text>
          <v-textarea
            id="comment"
            v-model="reject_reason"
            :error-messages="errorMessage"
            hint="To reject you have to fill comment."
            label="Comment"
            persistent-hint
          ></v-textarea>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="close">Cancel</v-btn>
          <v-btn color="error" text @click.stop="reject">Reject</v-btn>
          <v-btn color="green" text @click="approve()"
            >I understand - Approve
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogMaster" width="500">
      <v-card>
        <v-card-title primary-title>Who will be dealmaker?</v-card-title>
        <v-card-text>
          <v-btn color="green" text @click="openNew()"
            >Continue as myself
          </v-btn>
          <br />
          <v-btn
            v-if="active_delegation"
            color="cyan"
            text
            @click="openNewWithMaster()"
            >Continue as {{ active_delegation.master }}
          </v-btn>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="dialogMaster = false"
            >Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Home',

  data: () => ({
    queryObj: [],
    limit: 50,
    updateDataInterval: null,
    toggle: false,
    dialog: false,
    dialog_action: false,
    dialogMaster: false,
    reject_reason: '',
    errorMessage: '',
    requestId: '',
    items: [],
    myOnly: false,
    options: {},
    lengthItems: 0,
    filterDealText: 'My Deals',
    headers: [
      {
        text: 'Actions',
        value: 'actions',
        sortable: false,
        filterable: false
      },
      { text: 'Opportunity number', value: 'opportunityNumber' },
      { text: 'Deal ID', value: 'dealId' },
      { text: 'Deal state', value: 'status' },
      { text: 'Client name', value: 'customerName' },
      { text: 'Dealmaker', value: 'dealmaker' },
      { text: 'Approver', value: 'approver' },
      { text: 'Market', value: 'namedMarket' },
      { text: 'TCV', value: 'tcv' },
      { text: 'PR', value: 'pr' },
      { text: 'Created', value: 'created' },
      { text: 'Quarter', value: 'quarter' },
      { text: 'Revision', value: 'revision' },
      { text: 'Annuity user', value: 'annuityUserEmail' }
    ],
    mount: false
  }),

  computed: {
    ...mapState({
      active_delegation: state => state.user.active_delegation,
      bookmark: state => state.deals.bookmark,
      countries: state => state.countries.countries,
      deals: state => state.deals.deals,
      lastFetch: state => state.deals.lastFetch,
      loadingCountry: state => state.countries.loading,
      loadingDeal: state => state.deals.loading,
      loadingMarket: state => state.markets.loading,
      loadingSearchData: state => state.deals.loadingSearchData,
      loadingData: state => state.deals.loading,
      markets: state => state.markets.markets,
      role: state => state.user.role,
      searchData: state => state.deals.searchData,
      user_email: state => state.user.primary,
      userId: state => state.user.user_id
    }),
    showHeaders() {
      if (this.role !== 'Annuity')
        return this.headers.filter(e => e.value !== 'annuityUserEmail');
      return this.headers;
    },
    canCreate() {
      return this.role === 'Dealmaker';
    },
    haveMaster() {
      return this.active_delegation.master !== 'none';
    },
    loading() {
      return this.loadingDeal || this.loadingMarket || this.loadingCountry;
    },
    showMyOnlySwitch() {
      return (
        this.role !== 'Admin' &&
        this.role !== 'Reader' &&
        this.role !== 'Reviewer3'
      );
    }
  },
  watch: {
    queryObj: function() {
      localStorage.setItem('queryObj', JSON.stringify(this.queryObj));
      // condition to prevent fetching data on mounted if query is loaded from localStorage
      if (this.mount) {
        // reset bookmark and data after changing params of search
        this.$store.dispatch('deals/resetBookmark');
        this.$store.dispatch('deals/resetDeals');
        // fetch data after each change of queryObj
        this.getData();
      }
    },
    myOnly: function() {
      // reset bookmark and data after changing params of search
      localStorage.setItem('myOnly', JSON.stringify(this.myOnly));
      // condition to prevent fetching data on mounted if query is loaded from localStorage
      if (this.mount) {
        this.$store.dispatch('deals/resetBookmark');
        this.$store.dispatch('deals/resetDeals');
        // fetch data after each change of switch
        this.getData();
      }
    },
    deals: function() {
      if (!this.loading && this.items.length !== this.deals.length)
        this.setItems();
    },
    loading: function() {
      if (!this.loading) this.setItems();
    }
  },

  mounted() {
    this.$store.dispatch('deals/prefetchSearch');
    this.$store.dispatch('deals/resetDeals');
    if (this.markets.length === 0)
      this.$store.dispatch('markets/getAllMarkets');
    if (this.countries.length === 0)
      this.$store.dispatch('countries/getAllCountries');
    this.$store.dispatch('deals/resetDeal');
    // interval to fetch deals every hour
    this.updateDataInterval = setInterval(this.getData, 20 * 60000);
    // load search queryObj from local storage
    if (localStorage.getItem('queryObj')) {
      this.queryObj = JSON.parse(localStorage.getItem('queryObj'));
    }
    // load myOnly from local storage to use at search
    if (localStorage.getItem('myOnly')) {
      this.myOnly = JSON.parse(localStorage.getItem('myOnly'));
    }
    // reset bookmark for pagination
    this.$store.dispatch('deals/resetBookmark');
    // get deals
    this.getData();
  },

  beforeUpdate() {
    this.mount = true;
  },

  beforeDestroy() {
    this.$store.dispatch('deals/resetDeals');
    clearInterval(this.updateDataInterval);
  },

  methods: {
    /**
     * Method for updating deal to required structure
     * @returns {string} chip coloring
     */
    setItems() {
      this.items = this.deals
        ? this.deals.reduce((r, deal) => {
            const date = new Date(deal.created);
            const m = date.getMonth() + 1;
            deal.status = deal.repairing ? `br-${deal.status}` : deal.status;
            deal.quarter =
              Math.floor((m % 3 > 0 ? 1 : 0) + m / 3) +
              'Q' +
              date.getFullYear();
            deal.tcv = deal.tcvLocal
              ? deal.tcvLocal
              : deal.tcv
              ? deal.tcv
              : 'N/A';
            deal.pr = deal.periodRevUsd
              ? deal.periodRevUsd
              : deal.pr
              ? deal.pr
              : 'N/A';
            deal.reviewer = [];
            let reviews = [];
            for (let action in deal.actionItem) {
              if (deal.actionItem[action].reviews)
                reviews = [...reviews, ...deal.actionItem[action].reviews];
            }
            for (let review in reviews) {
              deal.reviewer.push(reviews[review].email);
            }
            r.push(deal);
            return r;
          }, [])
        : [];
    },
    /**
     * Method for computing chip color from search key
     * @param key - chip key
     * @returns {string} chip coloring
     */
    computeColor(key) {
      return key.startsWith('!') ? 'redLight' : 'greyLight';
    },

    /**
     * Handler after selecting v-autocomplete values
     * clears inputted characters and filter out
     * negative values from queryObj
     */
    autoCompleteChange() {
      this.$refs.autocomplete.lazySearch = '';

      // Filter out already used chips (or negative)
      for (let i = this.queryObj.length - 1; i >= 0; i--) {
        const item = this.queryObj[i];
        this.queryObj = this.queryObj.filter(i => {
          return !(
            i.head === item.head &&
            ('!' + i.value === item.value || i.value === '!' + item.value)
          );
        });
      }
    },

    /**
     * Method to toggle current chip in autocomplete search bar
     * @param item item from queryObj
     */
    toggleChip(item) {
      this.queryObj = this.queryObj.map(i => {
        if (i.value === item.value && i.head === item.head) {
          return i.value.startsWith('!')
            ? {
                ...i,
                value: i.value.slice(1),
                displayValue: i.displayValue.slice(4),
                key: i.head + '*' + i.value.slice(1)
              }
            : {
                ...i,
                value: `!${i.value}`,
                displayValue: `not ${i.displayValue}`,
                key: i.head + '*' + `!${i.value}`
              };
        }
        return i;
      });
    },
    // TODO: not used
    getDeals() {
      this.$store.dispatch('deals/getDeals');
    },

    /**
     * Function to remove item from queryObj if user clicked 'x' in chip
     * @param {object} item Item to remove
     */
    removeFromQuery(item) {
      this.queryObj = this.queryObj.filter(
        v => v.head + v.value !== item.head + item.value
      );
    },

    /**
     * Function takes array of attachments and fix their format
     * @param {Array} attachments Array of string attachments
     */
    fixAttachmentName(attachments) {
      if (attachments.length === 0) return 'None';

      let final_str = '';
      attachments.map((item, i) => {
        final_str += item
          .split('___')
          .slice(1)
          .join('___');
        if (i < attachments.length - 1) {
          final_str += ', ';
        }
      });
      return final_str;
    },
    /**
     * Function take care of color of of state chip in table
     */
    getColor(state) {
      let fullState = '';
      const STATE = state.split('br-').last();
      switch (STATE) {
        case 'submitted':
          fullState = 'cyan';
          break;
        case 'approved':
          fullState = 'greenLight';
          break;
        case 'signed':
          fullState = 'green';
          break;
        case 'in_progress_dm':
          fullState = 'amber';
          break;
        case 'draft':
          fullState = 'grey';
          break;
        case 'in_pricing':
          fullState = 'blue';
          break;
        case 'draft-BR':
          fullState = 'greyDark';
          break;
        case 'draft-IB':
          fullState = 'greyLight';
          break;
        case 'draft-BA':
          fullState = 'blueGrey';
          break;
        default:
          fullState = 'red';
          break;
      }
      return fullState;
    },
    open(id) {
      this.$router.push(`/request/${id}`);
    },
    close() {
      setTimeout(() => {
        this.dialog_action = false;
        this.reject_reason = null;
        this.requestId = '';
        this.errorMessage = '';
      }, 200);
    },
    createDeal() {
      if (this.haveMaster == true) {
        this.dialogMaster = true;
      } else {
        this.openNew();
      }
    },
    openNew() {
      this.$store.dispatch('deals/resetDeal');
      this.$router.push('/request');
    },
    openNewWithMaster() {
      this.dialogMaster = false;
      this.$store.dispatch('deals/resetDeal');
      this.$store.dispatch('deals/updateValue', {
        key: 'dealmakerMaster',
        value: this.active_delegation.master
      });
      this.$router.push('/request');
    },
    /**
     * Function to get deals using value at search and switch myOnly
     */
    getData() {
      let tmp = {
        limit: this.limit,
        bookmark: this.bookmark,
        opportunityNumber: [],
        dealId: [],
        status: [],
        customerName: [],
        dealmaker: [],
        approver: [],
        'market/sector': [],
        quarter: [],
        showOnlyMine: this.myOnly
      };
      this.queryObj.forEach(searchElement => {
        tmp[searchElement.head].push(searchElement.value);
      });
      this.$store.dispatch('deals/getDealsPage', tmp);
    },
    /**
     * Function to make results at search more human readable
     * @param {head, displayValue, ...} item  object of search include
     */
    searchDataReadable(item) {
      return item.head + ': ' + item.displayValue;
    }
  }
};
</script>

<style scoped>
.dots-horizontal-btn {
  transform: translateX(10%);
}
</style>
