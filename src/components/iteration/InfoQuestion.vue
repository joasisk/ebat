<template>
  <div v-show="show">
    <!-- information -->
    <p v-if="question.type !== 'file' && question.type !== 'select'">
      {{ question.label }}:&nbsp;
      <strong>{{ value }}</strong>
    </p>
    <!-- text input -->

    <!-- dropdown -->
    <v-select
      v-if="question.type === 'select'"
      :value="value"
      outlined
      dense
      item-text="text"
      item-value="value"
      :disabled="true"
      :label="question.label"
      :items="selectOptions"
      :error-messages="errorMessage"
    />
    <!-- file input -->
    <template v-if="question.type === 'file'">
      <div class="input-wrapper">
        <v-icon
          medium
          class="mb-6 mr-2"
          :disabled="value.length < 1"
          @click.stop="downloadFile(value)"
          >{{ value.length > 0 ? 'mdi-download' : 'mdi-paperclip' }}</v-icon
        >
        <v-file-input
          :value="fileValue"
          dense
          outlined
          :disabled="true"
          :label="question.label"
          :error-messages="errorMessage"
          :prepend-icon="null"
        />
      </div>
    </template>
    <!-- textarea -->
    <template v-if="question.type === 'text-area'">
      <div class="disabled-textarea">
        <p class="pre-label">{{ question.label }}:</p>
        <p class="pre">
          {{ value }}<span v-if="value.length === 0">-- no data --</span>
        </p>
      </div>
    </template>
    <!-- checkbox -->
    <!-- number input -->
    <!-- datepicker -->

    <!-- table-picker -->
    <!-- <v-data-table
      v-if="question.type === 'table-select'"
      v-model="value"
      :headers="question.config.table.headers"
      :items="this[question.config.table.items]"
      :show-select="!disabled"
      single-select
      dense
      item-key="index"
    /> -->
    <span v-if="question.type === 'table-select'">
      table picker not enabled
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'InfoQuestion',
  props: {
    question: {
      type: Object,
      required: true
    },
    dealKey: {
      type: String,
      required: true
    }
  },
  data: () => ({
    errorState: false,
    errorMessage: '',
    show: true,
    disabled: true
  }),
  computed: {
    ...mapState({
      items: function(state) {
        if (this.question.type === 'select') {
          const { items } = this.question.config.select;
          return state[items.toLowerCase()][items.toLowerCase()];
        } else {
          return [];
        }
      },
      userRole: state => state.user.role,
      userGeo: state => state.user.geo,
      email: state => state.user.primary,
      dealId(state) {
        return state.deals[this.dealKey]._id;
      },
      value(state) {
        return state.deals[this.dealKey][this.question.value];
      },
      fileValue(state) {
        if (this.question.type === 'file') {
          if (state.deals[this.dealKey][this.question.value][0]) {
            let splitted = state.deals[this.dealKey][
              this.question.value
            ][0].split('__');
            return new File([], splitted[splitted.length - 1]);
          }
          return null;
        }
        return undefined;
      }
    }),

    internalDisabled() {
      return this.question.config.disable
        ? this.parentValue === this.question.config.disable.disabledIf.value
        : this.disabled;
    },

    selectOptions() {
      if (this.question.type !== 'select') {
        return [];
      }
      if (this.question.config.select.type === 'custom') {
        return this.question.config.select.items.split('; ');
      }
      if (this.question.config.select.type === 'managed') {
        switch (this.question.config.select.items.toLowerCase()) {
          case 'markets':
            //if BPO than all markets, else filter based on geo
            if (this.userRole === 'BPO') return this.prepareMarket();
            return this.prepareMarket().filter(e =>
              this.userGeo.some(ug => ug === e.geo)
            );
          case 'categories':
            return this.prepareCategory();
          case 'geos':
            return this.prepareGeo();
          case 'countries':
            return this.prepareCountry().filter(
              e => e.market === this.parentValue
            );
          case 'reasons':
            return this.prepareReasons();

          default:
            return [];
        }
      }
      return this.question.config.select.items;
    }
  },
  mounted() {
    this.getAll();
    this.shouldShow();
  },
  updated() {
    this.autopopulate();
  },
  methods: {
    downloadFile(fileName, type) {
      if (this.value.length < 1) return;
      this.$store.dispatch('deals/downloadFile', {
        filename: fileName,
        dmss: type === 'dmss'
      });
    },
    validate() {
      if (!this.question.validation) return;
      // if validation is missing in question SKIP
      let error = false;
      Object.keys(this.question.validation).forEach(function(validation) {
        // check if validator is present
        if (this[validation]) {
          // call validator FN
          const ok = this[validation](
            this.value,
            this.question.validation[validation]
          );
          // if message returned set error state
          if (typeof ok === 'string') {
            error = true;
            this.errorState = true;
            this.errorMessage = ok;
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn('validator fn() missing', validation.type);
        }
      }, this);
      // if at least one error
      if (error) return;
      // if no error found reset error state and message
      this.errorState = false;
      this.errorMessage = '';
    },
    autopopulate() {
      // if (this.value == null || this.value == '' || this.value == 0) {
      //   if (this.question.config.autopopulate.autopopulate) {
      //     if (this[this.question.config.autopopulate.generatorHandler]) {
      //       const v = this[this.question.config.autopopulate.generatorHandler](
      //         this.question.config.autopopulate,
      //         this[this.question.config.autopopulate.dependency]
      //       );
      //       this.$emit('input', v);
      //     } else {
      //       console.error(
      //         this.question.config.autopopulate.generatorHandler,
      //         ' autopopulate handler is missing'
      //       );
      //     }
      //   }
      // } else {
      //   this.value = this.value;
      // }
    },
    removeFile(index) {
      this.value.splice(index, 1);
    },
    showFileName(f) {
      if (f.name) return f.name;
      return f
        .split('___')
        .slice(1)
        .join('___');
    },
    getAll() {
      if (
        this.question.type === 'select' &&
        this.question.config.select.type === 'managed' &&
        this.items.length === 0
      ) {
        let items = this.question.config.select.items;
        items = items.toLowerCase();
        items = items.charAt(0).toUpperCase() + items.slice(1);
        this.$store.dispatch(
          `${this.question.config.select.items.toLowerCase()}/getAll${items}`
        );
      }
    },
    prepareGeo() {
      return this.items.reduce((r, g) => {
        r.push({ text: g.name, value: g.geo_id });
        return r;
      }, []);
    },
    prepareMarket() {
      return this.items.reduce((r, m) => {
        r.push({ text: m.name, value: m.market_id, geo: m.geo_id });
        return r;
      }, []);
    },
    prepareCountry() {
      return this.items.reduce((r, c) => {
        r.push({
          text: c.name,
          value: c.country_id,
          market: c.market_id,
          countryCode: c.country_code
        });
        return r;
      }, []);
    },
    prepareCategory() {
      return this.items.reduce((r, c) => {
        r.push({ text: c.name, value: c.category_id });
        return r;
      }, []);
    },
    prepareReasons() {
      return this.items.reduce((r, e) => {
        r.push({ text: e.SA_RSN_DESC, value: e.SGNG_ADJMT_RSN_KEY });
        return r;
      }, []);
    },
    shouldShow() {
      if (this.dependingValue == null) {
        return;
      }
      const requiredValues = this.question.validation.required.value
        .split(';')
        .map(v => v.trim());
      this.show = requiredValues.some(v => {
        return this.dependingValue
          ? String(this.dependingValue).toLowerCase() ===
              String(v).toLowerCase()
          : false;
      });
    }
  }
};
</script>
<style lang="scss">
.input-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.disabled-textarea {
  position: relative;
  .pre-label {
    position: absolute;
    top: -9px;
    left: 10px;
    font-size: 0.8rem;
    padding: 0 2px;
  }
  .pre {
    white-space: pre-wrap;
    padding: 0.5rem;
    border: 1px solid grey;
    border-radius: 5px;
    max-height: 20rem;
    overflow-y: auto;
  }
}
.theme--light {
  .disabled-textarea {
    .pre-label {
      background: #f5f5f5;
    }
  }
}
.theme--dark {
  .disabled-textarea {
    .pre-label {
      background: #424242;
    }
  }
}
</style>
