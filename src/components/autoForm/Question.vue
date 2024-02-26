<template>
  <div v-show="show">
    <!-- information -->
    <p v-if="question.type === 'info'">
      {{ internalLabel }}:&nbsp;
      <strong>{{ value }}</strong>
    </p>
    <!-- text input -->
    <v-text-field
      v-if="question.type == null || question.type === 'text'"
      v-debounce="updateValue"
      dense
      outlined
      :disabled="disabled"
      :error-messages="errorMessage"
      :label="internalLabel"
      :value="value"
      :hint="question.config.hint"
    ></v-text-field>
    <!-- dropdown -->
    <v-select
      v-if="question.type === 'select'"
      :value="value"
      outlined
      dense
      item-text="text"
      item-value="value"
      persistent-hint
      :disabled="internalDisabled"
      :label="internalLabel"
      :items="selectOptions"
      :error-messages="errorMessage"
      :hint="question.config.hint"
      @change="updateValue"
    />
    <!-- file input multiple files -->
    <template
      v-if="question.type === 'file' && question.value == 'annuityAttachment'"
    >
      <v-file-input
        dense
        outlined
        multiple
        counter
        :disabled="disabledFileInput"
        :label="internalLabel"
        :error-messages="errorMessage"
        @change="updateValueFile($event)"
      />
      <v-chip-group v-if="value.length > 0" column class="chip-group">
        <v-chip
          v-for="(f, i) in value"
          :key="`file-chip-${i}`"
          class="max-width-chip"
          pill
          :close="!disabledFileInput"
          @click.stop="downloadFile(f, question.value)"
          @click:close="removeFileAnnuity(question.value, f, i, value)"
        >
          {{ nameOfFile(value[i]) }}
          <v-avatar v-if="disableRemoveFile" right>
            <v-icon>mdi-download</v-icon>
          </v-avatar>
        </v-chip>
      </v-chip-group>
    </template>
    <!-- file input just one files -->
    <template
      v-if="question.type === 'file' && question.value !== 'annuityAttachment'"
    >
      <v-chip-group v-if="showFileChips" column class="chip-group">
        <v-chip
          v-for="(f, i) in value"
          :key="`file-chip-${i}`"
          class="max-width-chip"
          pill
          :close="!disableRemoveFile"
          @click.stop="downloadFile(f, question.value)"
          @click:close="removeFile(value)"
        >
          {{ nameOfFile(value[i]) }}
          <v-avatar v-if="disableRemoveFile" right>
            <v-icon>mdi-download</v-icon>
          </v-avatar>
        </v-chip>
      </v-chip-group>
      <v-file-input
        v-else
        :value="value"
        dense
        outlined
        multiple
        counter
        :disabled="disabledFileInput"
        :label="internalLabel"
        :error-messages="errorMessage"
        @change="updateValueFile"
      />
    </template>
    <!-- textarea -->
    <template v-if="question.type === 'text-area'">
      <v-textarea
        v-if="!disabled"
        v-debounce="updateValue"
        dense
        outlined
        :disabled="disabled"
        :error-messages="errorMessage"
        :label="internalLabel"
        :hint="question.config.hint"
        :value="value"
      />
      <div v-else class="disabled-textarea">
        <p class="pre-label">{{ internalLabel }}:</p>
        <p class="pre">
          {{ value }}
          <span v-if="value !== undefined && value.length === 0">
            -- no data --
          </span>
        </p>
      </div>
    </template>
    <!-- checkbox -->
    <v-checkbox
      v-if="question.type === 'checkbox'"
      outlined
      dense
      :false-value="false"
      :true-value="true"
      :input-value="value"
      :disabled="disabled"
      :label="internalLabel"
      :error-messages="errorMessage"
      :hint="question.config.hint"
      @change="updateValue"
    />
    <!-- number input -->
    <v-number-input
      v-if="question.type === 'number'"
      v-debounce="updateValue"
      dense
      outlined
      :disabled="disabledNumberInput"
      :error-messages="errorMessage"
      :label="internalLabel"
      :show-controls="question.config.showControls"
      :value="value"
      :hint="question.config.hint"
      :whole-number="question.config.wholeNumber"
      :restrict-length="question.value === 'dbgNumber'"
    />
    <!-- datepicker -->
    <v-menu v-if="question.type === 'date'">
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-bind="attrs"
          append-icon="mdi-calendar-edit"
          dense
          outlined
          readonly
          :disabled="disabled"
          :error-label="errorMessage"
          :label="internalLabel"
          :value="value"
          :hint="question.config.hint"
          v-on="on"
        />
      </template>
      <v-date-picker :value="value" no-title @change="updateValue" />
    </v-menu>

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
import VNumberInput from '@/components/VNumberInput';
import generatorsMixin from '@/mixins/generators.mixin';
import questionMixin from '@/mixins/question.mixin';
import { mapState } from 'vuex';
export default {
  name: 'AutoQuestion',
  components: { VNumberInput },
  mixins: [questionMixin, generatorsMixin],
  props: {
    question: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    },
    parentValue: {
      type: [String, Number, Object, Array, File, Boolean],
      required: false,
      default: ''
    }
  },
  data: () => ({
    errorState: false,
    errorMessage: '',
    show: true
  }),
  computed: {
    ...mapState({
      // geo: state => state.deals.deal.geo,
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
      dealId: state => state.deals.deal._id,
      deal: state => state.deals.deal,
      value(state) {
        if (this.question.label === 'Status' && this.deal.annuityFlag) {
          if (state.deals.deal.status === 'draft')
            return state.deals.deal.status + '-' + this.deal.annuityFlag;
          return state.deals.deal.repairing
            ? `Bid repair: ${state.deals.deal.status}`
            : state.deals.deal.status;
        }
        return state.deals.deal[this.question.value];
      },
      showFileChips() {
        if (this.question.type === 'file') {
          return this.value ? this.value.length > 0 : false;
        }
        return false;
      },
      dependingValue(state) {
        return state.deals.deal[this.question.validation.required.field];
      },
      disabledNumberInput() {
        return this.question.value === 'dbgNumber' &&
          this.userRole === 'Dealmaker' &&
          !this.deal.annuityFlag
          ? false
          : this.question.value === 'dbgNumber'
          ? true
          : this.disabled;
      },
      disableRemoveFile() {
        return this.question.value === 'annuityAttachment' &&
          this.userRole === 'Annuity' &&
          this.deal.annuityFlag === 'IB' &&
          this.deal.annuityUserEmail?.toLowerCase() === this.email.toLowerCase()
          ? false
          : this.question.value === 'annuityAttachment'
          ? true
          : this.disabled;
      },
      disabledFileInput() {
        return (this.question.value === 'dmssAnalyzer' &&
          this.userRole === 'Approver') ||
          (this.question.value === 'annuityAttachment' &&
            this.userRole === 'Annuity' &&
            this.deal.annuityFlag === 'IB' &&
            this.deal.annuityUserEmail?.toLowerCase() ===
              this.email.toLowerCase())
          ? false
          : this.question.value === 'annuityAttachment'
          ? true
          : this.disabled;
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
            return this.prepareMarket();
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
    },

    internalLabel() {
      return `${this.question.label}${
        this.question.validation.required.required ? ' *' : ''
      }`;
    }
  },
  watch: {
    errorState(err) {
      this.$emit('error', {
        q: this.question.label,
        state: err ? err : null
      });
    },
    // parentValue: {
    //   deep: true,
    //   handler: function() {
    //     this.$emit('input', '');
    //     if (this.question.config.autopopulate.dependency === 'parentValue')
    //       this.autopopulate();
    //   }
    // },
    dependingValue() {
      this.shouldShow();
    }
  },
  mounted() {
    this.autopopulate();
    this.getAll();
    this.shouldShow();
  },
  updated() {
    this.autopopulate();
  },
  methods: {
    downloadFile(fileName) {
      if (this.value.length < 1) return;
      this.$store.dispatch('deals/downloadFile', {
        filename: encodeURIComponent(fileName),
        dmss: this.question.value === 'dmss'
      });
    },
    nameOfFile(value) {
      return value
        .split('__')
        .splice(2)
        .join('__');
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
      if (this.disabled) return;
      if (this.value == null || this.value == '' || this.value == 0) {
        if (this.question.config.autopopulate.autopopulate) {
          if (this[this.question.config.autopopulate.generatorHandler]) {
            const v = this[this.question.config.autopopulate.generatorHandler](
              this.question.config.autopopulate,
              this[this.question.config.autopopulate.dependency]
            );
            this.updateValue(v);
          } else {
            // eslint-disable-next-line no-console
            console.error(
              this.question.config.autopopulate.generatorHandler,
              ' autopopulate handler is missing'
            );
          }
        }
      }
    },
    removeFileAnnuity(section, fileName, fileIndex, files) {
      files.splice(fileIndex, 1);
      this.$store.dispatch('deals/deleteFile', {
        key: section,
        fileName: fileName,
        fileType: this.question.value,
        reqId: this.dealId,
        value: files
      });
    },
    removeFile(fileName) {
      this.$store.dispatch('deals/deleteFile', {
        key: this.question.value,
        fileName: fileName[0],
        fileType: this.question.value,
        reqId: this.dealId,
        value: []
      });
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
        if (this.internalDisabled) {
          r.push({ text: g.name, value: g.geo_id });
        } else if (this.userGeo.some(ug => ug === g.geo_id))
          r.push({ text: g.name, value: g.geo_id });
        return r;
      }, []);
    },
    prepareMarket() {
      return this.items.reduce((r, m) => {
        if (this.internalDisabled) {
          r.push({ text: m.name, value: m.market_id, geo: m.geo_id });
        } else if (this.userGeo.some(ug => ug === m.geo_id))
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
    updateValue(value) {
      this.$store.dispatch('deals/updateValue', {
        key: this.question.value,
        value
      });
      this.validate();
    },
    updateValueFile(files) {
      if (files == null) {
        return;
      }

      if (this.question.value === 'dmss') {
        this.$store.dispatch('deals/update');
        this.$store.dispatch('deals/updateValue', {
          key: this.question.value,
          value: [files[0].name]
        });
      }
      files.forEach(file => {
        if (file == null) return;
        if (typeof file.name !== 'string') return;

        const fd = new FormData();
        fd.append('file', file);

        this.$store.dispatch('deals/uploadFile', {
          reqid: this.dealId,
          socketid: window.btoa(this.email),
          fd,
          fileType: this.question.value,
          filename: file.name
        });
      });
      return;
    },
    shouldShow() {
      if (
        this.dependingValue == null ||
        !this.question.validation.required.show
      ) {
        return (this.show = true);
      }
      // handle any value
      if (
        this.question.validation.required.value.trim().toLowerCase() === 'any'
      ) {
        if (typeof this.dependingValue == 'string') {
          return (this.show = this.dependingValue.length > 0);
        }
        if (typeof this.dependingValue == 'number') {
          return (this.show = this.dependingValue != null);
        }
        if (typeof this.dependingValue == 'object') {
          return (this.show = this.dependingValue.length > 0);
        }
        return (this.show = false);
      }
      // handle specific values
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
.max-width-chip {
  .v-chip {
    max-width: 100%;
  }
  .v-chip__content {
    line-height: 32px;
    padding-right: 30px !important;
    display: inline-block !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
  }
  .v-chip__close {
    position: absolute;
    top: 7px;
    right: 3px;
    width: 24px;
  }
}
.chip-group {
  width: 100% !important;
}
.chip-overflow {
  height: auto !important;
  white-space: nowrap !important;
}
</style>
