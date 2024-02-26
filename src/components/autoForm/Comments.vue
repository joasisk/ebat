<template>
  <div>
    <h3>Discussion</h3>
    <div v-if="comments.length === 0">
      <p>no comments yet</p>
    </div>
    <div class="comments-wrapper">
      <v-scroll-x-transition group>
        <v-card
          v-for="(comment, ci) in comments"
          :key="section + 'comment' + ci"
          class="mx-auto mb-3"
          outlined
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline">
                By: {{ comment.by }} as {{ comment.role }}
              </div>
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
      </v-scroll-x-transition>
    </div>
    <template v-if="!nonCommentable">
      <v-textarea
        v-model="newComment"
        label="Add Comment"
        dense
        outlined
        :loading="loading"
      />
      <v-btn :disabled="disableNewComment" @click="addComment"
        >Add comment</v-btn
      >
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'Comments',
  props: {
    section: {
      type: String,
      required: true
    },
    questionSectionIndex: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      newComment: '',
      loading: false
    };
  },
  computed: {
    ...mapState({
      dealID: state => state.deals.deal._id,
      comments(state) {
        if (!state.deals.deal[this.section]) return [];
        let comments =
          this.questionSectionIndex >= 0
            ? state.deals.deal[this.section][this.questionSectionIndex].comments
            : state.deals.deal[this.section].comments;
        if (!comments) comments = [];
        return comments;
      },
      user: state => state.user.primary,
      status: state => state.deals.deal.status,
      annuityUserEmail: state => state.deals.deal.annuityUserEmail,
      role: state => state.user.role,
      socket: state => state.sockets.requests
    }),
    disableNewComment() {
      return this.newComment.trim().length === 0 || this.uploading;
    },
    nonCommentable() {
      return (
        this.status === 'approved' ||
        this.status === 'signed' ||
        this.status === 'loss' ||
        this.status === 'slipped' ||
        this.status === 'iterated' ||
        (this.role == 'Annuity' &&
          (this.status === 'submitted' ||
            this.status === 'in_pricing' ||
            this.status === 'in_progress_dm')) ||
        (this.status === 'submitted' && this.role == 'Approver') ||
        (this.status === 'draft' &&
          this.role == 'Annuity' &&
          this.annuityUserEmail?.toLowerCase() !== this.user.toLowerCase())
      );
    },
    uploading() {
      return this.socket.filter(e => e.status === 'U').length > 0;
    }
  },
  methods: {
    addComment() {
      if (this.disableNewComment) {
        return;
      }
      if (this.questionSectionIndex != -1) {
        return this.$store.dispatch('deals/addSectionComment', {
          dealID: this.dealID,
          section: this.section,
          index: this.questionSectionIndex,
          comment: this.newComment,
          user: this.user,
          role: this.role
        });
      }
      this.loading = true;
      this.$store
        .dispatch('deals/addComment', {
          dealID: this.dealID,
          comment: { [this.section]: this.newComment },
          user: this.user,
          role: this.role
        })
        .then(() => ((this.loading = false), (this.newComment = '')))
        .catch(() => (this.loading = false));
    }
  }
};
</script>

<style lang="scss" scoped>
.comments-wrapper {
  max-height: 30rem;
  overflow: auto;
  margin-bottom: 1rem;
}
.comment {
  white-space: pre-wrap;
}
</style>
