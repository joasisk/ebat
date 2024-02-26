<template>
  <div>
    <v-card class="mt-6">
      <v-card-title>Countries</v-card-title>
      <!-- TABLE OF COUNTRIES -->
      <v-data-table
        :headers="countryHeaders"
        :items="reducedCountry"
        item-key="country_id"
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
    <!-- REMOVE COUNTRY DIALOG -->
    <v-dialog v-model="showDeleteDialog" persistent width="500">
      <v-card>
        <v-card-title primary-title>
          Confirm deletion of Country
        </v-card-title>
        <v-card-text>
          This actions is going to permanently delete
          <b>{{ country.name }}</b> country.
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="hideDialog('delete')">
            Cancel
          </v-btn>
          <v-btn color="red" text @click="deleteCountry">
            Confirm - delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- ADD COUNTRY DIALOG -->
    <v-dialog v-model="showNewDialog" width="500" persistent>
      <v-card>
        <v-card-title primary-title>
          Create new Country
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="country.market_id"
            :items="markets"
            label="Select market"
            item-text="name"
            item-value="market_id"
            outlined
            dense
          ></v-select>
          <v-text-field
            v-if="country.market_id !== ''"
            v-model="country.name"
            label="Country"
            outlined
            dense
          ></v-text-field>
          <v-text-field
            v-if="country.market_id !== ''"
            v-model="country.country_code"
            label="Country code"
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
            @click="addCountry"
          >
            Create country
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'CountryTable',

  data: () => ({
    showNewDialog: false,
    showDeleteDialog: false,
    countryHeaders: [
      { text: 'Country', value: 'name' },
      { text: 'Market', value: 'market_id' },
      { text: 'Actions', value: 'actions', sortable: false, filterable: false }
    ],
    market: '',
    country: {
      name: '',
      market_id: '',
      country_code: ''
    }
  }),

  computed: {
    ...mapState({
      countries: state => state.countries.countries,
      markets: state => state.markets.markets,
      loading: state => state.countries.loading
    }),
    reducedCountry() {
      return this.countries.reduce((r, a) => {
        return [
          ...r,
          {
            ...a,
            market_id: this.markets
              .filter(g => g.market_id == a.market_id)
              .map(g => g.name)[0]
          }
        ];
      }, []);
    },
    disableSubmit() {
      return !(
        this.country.market_id !== '' &&
        this.country.name !== '' &&
        this.country.country_code !== ''
      );
    }
  },

  methods: {
    /**
     * Function opens the delete dialog for certain country
     * @param {object} country - Country that should be deleted
     */
    openDeleteOverlay(country) {
      this.country = country;
      this.showDeleteDialog = true;
    },
    /**
     * Function that hides the dialog window
     * @param {string} dialog - Dialog that should be closed ('delete', 'add', ...)
     */
    hideDialog(dialog) {
      if (dialog === 'delete') this.showDeleteDialog = false;
      if (dialog === 'add') this.showNewDialog = false;
      setTimeout(
        () => (this.country = { name: '', market_id: '', country_code: '' }),
        200
      );
    },
    /**
     * Function deletes the chosen country
     */
    deleteCountry() {
      this.$store.dispatch('countries/removeCountry', this.country.country_id);
      this.hideDialog('delete');
    },
    /**
     * Function creates the chosen country based on `this.country`
     */
    addCountry() {
      this.$store.dispatch('countries/addCountry', this.country);
      this.hideDialog('add');
    }
  }
};
</script>
