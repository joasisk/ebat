<template>
  <div>
    <v-card class="mt-6">
      <v-card-title>Markets</v-card-title>
      <!-- TABLE OF MARKETS -->
      <v-data-table
        :headers="marketHeaders"
        :items="reducedMarkets"
        item-key="market_id"
        :loading="loading"
      >
        <template v-slot:top>
          <v-btn
            color="primary"
            dark
            small
            absolute
            top
            right
            fab
            @click.stop="showNewDialog = true"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon small color="red" @click.stop="openDeleteOverlay(item)">
            <v-icon>mdi-delete-circle</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <!-- DELETE MARKET DIALOG -->
    <v-dialog v-model="showDeleteDialog" persistent width="500">
      <v-card>
        <v-card-title primary-title>
          Confirm deletion of market
        </v-card-title>
        <v-card-text>
          This actions is going to permanently delete
          <b>{{ market.name }}</b> market.
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="hideDialog('delete')">
            Cancel
          </v-btn>
          <v-btn color="red" text @click="deleteMarket">
            Confirm - delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- ADD MARKET DIALOG -->
    <v-dialog v-model="showNewDialog" width="500" persistent>
      <v-card>
        <v-card-title primary-title>
          Create new Market
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="market.geo_id"
            :items="geos"
            label="Select GEO"
            item-text="name"
            item-value="geo_id"
            outlined
            dense
          ></v-select>
          <v-text-field
            v-if="market.geo_id !== ''"
            v-model="market.name"
            label="Market"
            outlined
            dense
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="hideDialog('add')">
            Cancel
          </v-btn>
          <v-btn
            color="green"
            text
            :disabled="disableSubmit"
            @click="addMarket"
          >
            Create Market
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'MarketTable',

  data: () => ({
    marketHeaders: [
      { text: 'Market', value: 'name' },
      { text: 'GEO', value: 'geo_id' },
      { text: 'Actions', value: 'actions', sortable: false, filterable: false }
    ],
    market: {
      name: '',
      geo_id: ''
    },
    showDeleteDialog: false,
    showNewDialog: false
  }),

  computed: {
    ...mapState({
      markets: state => state.markets.markets,
      geos: state => state.geos.geos,
      loading: state => state.markets.loading,
      reducedMarkets() {
        return this.markets.reduce((r, a) => {
          return [
            ...r,
            {
              ...a,
              geo_id: this.geos
                .filter(g => g.geo_id == a.geo_id)
                .map(g => g.name)[0]
            }
          ];
        }, []);
      }
    }),
    disableSubmit() {
      return !(this.market.name !== '' && this.market.geo_id !== '');
    }
  },

  methods: {
    /**
     * Function opens the dialog to delete market
     * @param {object} market - Market to be deleted
     */
    openDeleteOverlay(market) {
      this.market = market;
      this.showDeleteDialog = true;
    },
    /**
     * Function that hides the dialog window
     * @param {string} dialog - Dialog that should be closed ('delete', 'add', ...)
     */
    hideDialog(dialog) {
      if (dialog === 'add') this.showNewDialog = false;
      if (dialog === 'delete') this.showDeleteDialog = false;
      setTimeout(() => (this.market = { name: '', geo_id: '' }), 200);
    },
    /**
     * Function deletes the chosen market based on `this.market`
     */
    deleteMarket() {
      this.$store.dispatch('markets/removeMarket', this.market.market_id);
      this.hideDialog('delete');
    },
    /**
     * Function creates the chosen market based on `this.market`
     */
    addMarket() {
      this.$store.dispatch('markets/addMarket', this.market);
      this.hideDialog('add');
    }
  }
};
</script>
