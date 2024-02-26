<template>
  <v-row class="mt-2 mb-2">
    <v-col cols="4">
      <p class="pl-4">
        Please think about and describe your feature: WHO will use the feature 
        you are requesting, WHAT should the user do, WHAT should be the result, 
        WHEN can this action be performed, WHAT happens in case of error, and similar.
      </p>
    </v-col>
    <v-col cols="8">
      <v-form ref="form" v-model="valid">
        <v-text-field
          v-model="title"
          label="Title"
          class="pr-4"
          :rules="[rules.required, rules.length]"
        ></v-text-field>
        <v-textarea
          v-model="description"
          label="Description"
          class="pr-4"
          :rules="[rules.required]"
        ></v-textarea>
      </v-form>
      <v-btn
        class="ma-2"
        :loading="loading"
        :disabled="loading"
        color="primary"
        @click="sendRequest()"
      >
        Send request
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import validationMixin from '@/mixins/validation.mixin';
import { mapState } from 'vuex';

export default {
  name: 'RequestFeatureForm',
  data: () => ({
    description: '',
    title: '',
    valid: true,
    rules: {
      required: value => !!value || 'This field is required.',
      length: value =>
        !validationMixin.validateLength(value, 10, 150) ||
        'Field should be minimum of 10 characters and maximum of 150'
    }
  }),
  computed: {
    ...mapState({
      loading: state => state.feedback.loading
    })
  },
  methods: {
    sendRequest() {
      if (this.$refs.form.validate()) {
        let request = { title: this.title, description: this.description };
        this.$store.dispatch('feedback/createRequest', request);
      }
    }
  }
};
</script>
