<template>
  <v-container fluid pt-3>
    <v-card class="mt-6">
      <v-tabs v-model="type">
        <v-tab key="bug">Report a Bug</v-tab>
        <v-tab key="feature">Request a Feature</v-tab>
      </v-tabs>
      <v-tabs-items v-model="type">
        <v-tab-item key="bug">
          <report-bug-form />
        </v-tab-item>
        <v-tab-item key="feature">
          <request-feature-form />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-container>
</template>

<script>
import ReportBugForm from '@/components/feedback/ReportBugForm';
import RequestFeatureForm from '@/components/feedback/RequestFeatureForm';

export default {
  name: 'Feedback',
  components: {
    ReportBugForm,
    RequestFeatureForm
  },
  data: () => ({
    type: null
  })
};
</script>
