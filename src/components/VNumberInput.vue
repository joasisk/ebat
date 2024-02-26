<template>
  <v-input>
    <v-text-field
      v-model.number="internalValue"
      dense
      outlined
      type="number"
      :disabled="disabled"
      :label="label"
      :error-messages="errorMessages"
      :hint="
        wholeNumber
          ? hint
            ? 'Whole number only, ' + hint
            : 'Whole number only.'
          : hint
      "
      @keydown="restrictKeydown"
    />
    <div v-if="showControls" slot="append">
      <v-icon small @click="increment()">mdi-plus</v-icon>
      <v-icon small @click="decrement()">mdi-minus</v-icon>
    </div>
  </v-input>
</template>

<script>
export default {
  name: 'VNumberInput',
  props: {
    value: {
      type: [Number, String],
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    errorMessages: {
      type: [Array, String],
      default: ''
    },
    step: {
      type: Number,
      default: 1
    },
    showControls: {
      type: Boolean,
      default: false
    },
    wholeNumber: {
      type: Boolean,
      default: false
    },
    hint: {
      type: String,
      default: ''
    },
    restrictLength: {
      type: [Boolean, String],
      default: false
    }
  },
  data: () => ({
    internalValue: 0
  }),

  watch: {
    internalValue(v) {
      if (v != this.value) {
        if (this.wholeNumber) {
          this.internalValue = Math.trunc(v);
        }
        this.$emit('input', this.wholeNumber ? Math.trunc(v) : v);
      }
    },
    value(v) {
      if (v != this.internalValue) {
        this.internalValue = v;
      }
    }
  },

  mounted() {
    if (this.value != this.internalValue) {
      this.internalValue = this.value;
    }
  },

  methods: {
    increment() {
      this.internalValue = this.internalValue + this.step;
    },
    decrement() {
      this.internalValue = this.internalValue - this.step;
    },
    restrictKeydown(e) {
      let allowed_presses = [8, 46, 190]; // workaround for keydown
      if (/^[a-zA-Z]$/.test(e.key) || (this.restrictLength && this.internalValue.toString().length > 6)) {
        if (!allowed_presses.includes(e.keyCode)) e.returnValue = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep input::-webkit-outer-spin-button,
::v-deep input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
