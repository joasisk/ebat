<template>
  <v-container fluid pa-0 ma-0>
    <v-row>
      <v-col>
        <h1>Deal Sum</h1>
        <v-container fluid pa-1 ma-0>
          <v-row>
            <v-col
              v-for="(g_data, group) in dealSum"
              :key="group"
              :cols="
                typeof g_data == 'object'
                  ? group == 'New OTC (counts toward Qualified OTC)' ||
                    group == 'Committed Renewals' ||
                    group == 'Other'
                    ? 12
                    : 4
                  : 2
              "
              pa-1
            >
              <h2>
                {{ group }}
              </h2>

              <v-container v-if="typeof g_data == 'object'" fluid pa-1>
                <v-row>
                  <v-col
                    v-for="(sg_data, subGroup) in g_data"
                    :key="subGroup"
                    :cols="
                      typeof sg_data == 'object'
                        ? subGroup == 'Renewals'
                          ? 12
                          : 6
                        : 3
                    "
                    pa-1
                  >
                    <h3>
                      {{ subGroup }}
                    </h3>

                    <v-container v-if="typeof sg_data == 'object'" fluid>
                      <v-row>
                        <v-col
                          v-for="(sg2_data, sub2Group) in sg_data"
                          :key="sub2Group"
                          :cols="sub2Group == 'Non-PA Appliances' ? 8 : 4"
                          class="pa-1 ma-0"
                        >
                          <h4>
                            {{ sub2Group }}
                          </h4>

                          <v-container v-if="typeof sg2_data == 'object'" fluid>
                            <v-row>
                              <v-col
                                v-for="(sg3_data, sg3) in sg2_data"
                                :key="sg3"
                                class="pa-1 ma-0"
                              >
                                <h5>{{ sg3 }}</h5>

                                <template v-if="typeof sg3_data == 'object'">
                                  <p v-for="(v, k) in sg3_data" :key="k">
                                    <strong>{{ k }}</strong>
                                    {{ v }}
                                  </p>
                                </template>
                                <p v-else>
                                  {{ sg3_data }}
                                </p>
                              </v-col>
                            </v-row>
                          </v-container>

                          <p v-else>{{ sg2_data }}</p>
                        </v-col>
                      </v-row>
                    </v-container>

                    <p v-else>
                      {{ sg_data }}
                    </p>
                  </v-col>
                </v-row>
              </v-container>

              <!-- if direct data -->
              <p v-else>
                {{ g_data }}
              </p>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'DealSum',
  computed: {
    ...mapState({
      dealSum: state => state.deals.deal.dealSum
    })
  }
};
</script>
