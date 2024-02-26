<template>
  <v-container>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field
        v-model="title"
        label="Title"
        class="pr-4"
        :rules="[rules.required, rules.length]"
      ></v-text-field>
      <v-textarea
        v-model="expected"
        dense
        label="Expected behaviour"
        :rules="[rules.required]"
        outlined
      />
      <v-textarea
        v-model="incident"
        dense
        label="What happened"
        :rules="[rules.required]"
        outlined
      />
      <v-textarea
        v-model="steps"
        dense
        label="Steps to reproduce"
        :rules="[rules.required]"
        outlined
      />
    </v-form>
    <v-btn
      class="ma-2"
      :loading="loading"
      :disabled="loading"
      color="primary"
      @click="sendReport()"
    >
      Send report
    </v-btn>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import validationMixin from '@/mixins/validation.mixin';

export default {
  name: 'ReportBugForm',
  data: () => ({
    valid: true,
    title: '',
    expected: '',
    incident: '',
    steps: '',
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
    sendReport() {
      if (this.$refs.form.validate()) {
        let report = {};
        report.title = this.title;
        report.description = `Expected behaviour:
${this.expected}
What happened:
${this.incident}
Steps to reproduce:
${this.steps}`;

        this.$store.dispatch('feedback/createReport', report);
      }
    }
  }
};
</script>
