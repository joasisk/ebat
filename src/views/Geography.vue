<template>
  <div>
    <h1>Geography</h1>
    <v-row class="px-5">
      <v-col><geo-table /></v-col>
      <v-col><market-table /></v-col>
      <v-col><country-table /></v-col>
    </v-row>
  </div>
</template>

<script>
import GeoTable from '@/components/geos/Geo.vue';
import MarketTable from '@/components/geos/Market.vue';
import CountryTable from '@/components/geos/Country.vue';
export default {
  components: { GeoTable, MarketTable, CountryTable },
  mounted() {
    this.$store.dispatch('geos/getAllGeos');
    this.$store.dispatch('markets/getAllMarkets');
    this.$store.dispatch('countries/getAllCountries');
  }
};
</script>

<style></style>
