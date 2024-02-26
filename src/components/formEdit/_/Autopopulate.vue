<template>
  <v-container fluid class="pa-0 ma-0">
    <v-row>
      <v-col>
        <v-select
          v-model="generatorHandler"
          label="Value generator"
          item-text="text"
          item-value="value"
          :items="generators"
        />
      </v-col>
      <v-col v-show="generatorHandler === 'randstr'">
        <v-text-field v-model="length" label="Length" type="number" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import generatorMixin from '@/mixins/generators.mixin';

export default {
  name: 'Autopopulate',
  mixins: [generatorMixin],

  props: {
    value: {
      type: [Object, undefined, null],
      required: true,
      default: () => ({
        autopopulate: false,
        generator: {
          handler: ''
        }
      })
    }
  },

  data() {
    return {
      autopopulate: false,
      generatorHandler: '',
      length: 0,
      storeValue: null
    };
  },

  watch: {
    generatorHandler: function() {
      this.update();
    },
    length: function() {
      this.update();
    },
    storeValue: function() {
      this.update();
    }
  },

  mounted() {
    this.autopopulate = this.value.autopopulate;
    this.generatorHandler = this.value.generatorHandler;
    this.length = this.value.length;
    this.storeValue = this.value.storeValue;
  },

  methods: {
    update() {
      this.$emit('input', {
        autopopulate: this.autopopulate,
        generatorHandler: this.generatorHandler,
        length: this.length,
        storeValue: this.storeValue
      });
    }
  }
};
</script>
