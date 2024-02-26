<template>
  <v-card>
    <v-card-text class="pa-0">
      <code class="code">
        {{ json }}
      </code>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'FormJson',
  props: {
    form: {
      required: true,
      type: Object
    }
  },
  computed: {
    json() {
      return JSON.stringify(this.form, null, '  ');
    }
  }
};
</script>
<style>
.code {
  display: block;
  white-space: pre-wrap;
}
</style>
