<template>
  <div>
    <h3>Discussion</h3>
    <div v-if="comments.length === 0">
      <p>no comments</p>
    </div>
    <v-card
      v-for="(comment, ci) in comments"
      :key="section + 'comment' + ci"
      class="mx-auto mb-3"
      outlined
    >
      <v-list-item three-line>
        <v-list-item-content>
          <div class="overline">By: {{ comment.by }} as {{ comment.role }}</div>
          <v-list-item-title class="comment">
            <template v-if="comment.review">{{ comment.review }}</template>
            {{ comment.comment }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ new Date(comment.timestamp) }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-avatar rounded size="40" color="grey">
          <v-img
            :src="
              `https://w3-unifiedprofile-api-production.dal1a.cirrus.ibm.com/v3/image/${comment.by}?type=bp&def=avatar&s=50x50&disableCaching=false`
            "
          />
        </v-list-item-avatar>
      </v-list-item>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'InfoComments',
  props: {
    section: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      default: -1
    },
    dealKey: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState({
      comments(state) {
        return this.index >= 0
          ? state.deals[this.dealKey][this.section][this.index].comments
          : state.deals[this.dealKey][this.section];
      }
    })
  }
};
</script>

<style lang="scss" scoped>
.comment {
  white-space: pre-wrap;
}
</style>
