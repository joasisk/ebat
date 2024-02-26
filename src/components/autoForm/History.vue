<template>
  <v-card class="darken-3">
    <v-card-title>History</v-card-title>
    <v-list>
      <template v-for="(item, index) in history">
        <div :key="`history-${index}`">
          <v-list-item three-line>
            <v-list-item-avatar circular size="40" color="grey">
              <v-img
                :src="
                  `https://w3-unifiedprofile-api-production.dal1a.cirrus.ibm.com/v3/image/${item.submitter}?type=bp&def=avatar&s=50x50&disableCaching=false`
                "
              />
            </v-list-item-avatar>

            <v-list-item-content>
              <strong>By: {{ item.submitter }}</strong>
              <v-list-item-title>{{
                item.operation.replace(item.submitter, '')
              }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ new Date(item.date) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider v-if="index != history.length - 1" />
        </div>
      </template>
    </v-list>
  </v-card>
</template>
<script>
export default {
  props: {
    history: {
      type: Array,
      required: true
    }
  }
};
</script>
