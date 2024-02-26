<template>
  <v-container fluid class="pt-0">
    <v-row v-for="(row, index) in form.rows" :key="`row-${index}`">
      <template v-for="(col, cindex) in row.columns">
        <v-col
          v-if="sectionAccessible(col.access)"
          :key="`col-${index}-${cindex}`"
          :cols="col.width"
        >
          <v-card color="greyContrast">
            <v-card-title v-if="col.title">{{ col.title }}</v-card-title>
            <v-container>
              <info-question
                v-for="(question, qindex) in col.questions"
                :key="`question-${index}-${cindex}-${qindex}`"
                :question="question"
                :deal-key="dealKey"
              />

              <v-data-table
                v-if="col.table.hasTable"
                :dense="col.table.dense"
                :disable-sort="!col.table.sortable"
                :disable-filtering="!col.table.searchable"
                :headers="col.table.headers"
                :items="form.data[col.table.rows]"
              >
                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn
                    v-for="(action, ai) in col.table.inlineActions"
                    v-show="submitAllowed"
                    :key="`${item.id}-${ai}`"
                    right
                    icon
                    :color="action.color"
                    @click.stop="click(action.click, item)"
                  >
                    <v-icon>{{ action.icon }}</v-icon>
                  </v-btn>
                </template>
              </v-data-table>

              <section v-if="col.comments.comments">
                <v-divider />
                <info-comments
                  :section="col.comments.comments"
                  :deal-key="dealKey"
                />
              </section>
            </v-container>
          </v-card>
        </v-col>
      </template>
      <info-q-s
        v-if="row.questionSection"
        :question-section="row.questionSection"
        :deal-key="dealKey"
      />
    </v-row>
    <v-row>
      <v-col>
        <history v-if="deal.history" :history="deal.history" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import formMixin from '@/mixins/form.mixin';
import formService from '../../services/form.service';

// import Comments from './InfoComments';
import { ROLES } from '@/config/roles.js';
import { mapState } from 'vuex';
import History from '../autoForm/History.vue';
import InfoComments from './InfoComments.vue';
import InfoQS from './InfoQS.vue';
import InfoQuestion from './InfoQuestion';

export default {
  name: 'InfoForm',

  components: {
    InfoQuestion,
    InfoQS,
    InfoComments,
    History
  },

  mixins: [formMixin],

  props: {
    dealKey: {
      type: String,
      default: 'deal'
    }
  },

  data: () => ({
    actions: false,
    disableSubmit: false,
    formError: {},
    reviewerType: '',
    reviewer: '',
    roles: ROLES,
    form: {}
  }),

  computed: {
    ...mapState({
      email: state => state.user.primary,
      role: state => state.user.role,
      deal(state) {
        return state.deals[this.dealKey];
      },
      dealID(state) {
        return state.deals[this.dealKey]._id;
      }
    }),
    roleID() {
      return this.roles.find(r => r.role === this.role).role_id;
    }
  },
  mounted() {
    formService.getFormById(this.dealID).then(async r => {
      this.form = r;
    });
  },
  methods: {
    sectionAccessible(users) {
      return users.some(user => user === this.roleID);
    },

    parseError() {
      let err = Object.keys(this.formError).some(key => {
        return this.formError[key] != null;
      });
      this.disableSubmit = err;
    },

    handleCountryCode(code) {
      this.form.data.countryCode = code;
    },

    getOverlayActionDisabled(config, value) {
      if (config == null) return false;
      if (this.form.data[value][config.disabled.if.parameter] == null)
        return false;
      const ifNull =
        this.form.data[value][config.disabled.if.parameter].index == null;
      let orParam = false;
      if (config.disabled.or) {
        if (this.form.data[value][config.disabled.or.parameter] != null) {
          orParam =
            this.form.data[value][config.disabled.or.parameter] ==
            config.disabled.or.value;
        }
      }
      return ifNull || orParam;
    },

    resolvedAs(type) {
      if (type === 'signed' || type === 'loss' || type === 'slipped')
        this.$store.dispatch('deals/resolve', type);
      else throw new Error('Non valid resolve type');
    }
  }
};
</script>
