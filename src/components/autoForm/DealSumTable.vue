<template>
  <v-container fluid pa-0>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            Deal Sum: IBM CONFIDENTIAL
          </v-card-title>
          <v-container fluid pa-0>
            <v-row>
              <v-col>
                <h2>MLC</h2>
                <v-data-table
                  :headers="headers"
                  disable-filtering
                  disable-sort
                  dense
                  hide-default-footer
                  :items="mlc"
                  :footer-props="footer"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h2>New OTC (counts toward Qualified OTC)</h2>
                <v-data-table
                  :headers="headers"
                  disable-filtering
                  disable-sort
                  dense
                  hide-default-footer
                  :items="otc"
                  group-by="group"
                  :footer-props="footer"
                >
                  <template slot="group.header" slot-scope="props">
                    <td v-if="props.group" colspan="6" class="font-weight-bold">
                      <v-icon
                        v-if="props.isOpen"
                        class="my-1 ml-1"
                        @click.stop="props.toggle"
                      >
                        mdi-chevron-down
                      </v-icon>
                      <v-icon
                        v-else
                        class="my-1 ml-1"
                        @click.stop="props.toggle"
                      >
                        mdi-chevron-right
                      </v-icon>
                      {{ props.group }}
                    </td>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h2>Committed Renewals</h2>
                <v-data-table
                  :headers="headers"
                  disable-filtering
                  disable-sort
                  dense
                  hide-default-footer
                  :items="renewals"
                  group-by="group"
                  :footer-props="footer"
                >
                  <template slot="group.header" slot-scope="props">
                    <td v-if="props.group" colspan="6" class="font-weight-bold">
                      <v-icon
                        v-if="props.isOpen"
                        class="my-1 ml-1"
                        @click.stop="props.toggle"
                      >
                        mdi-chevron-down
                      </v-icon>
                      <v-icon
                        v-else
                        class="my-1 ml-1"
                        @click.stop="props.toggle"
                      >
                        mdi-chevron-right
                      </v-icon>
                      {{ props.group }}
                    </td>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h2>Other</h2>
                <v-data-table
                  :headers="headers"
                  disable-filtering
                  disable-sort
                  dense
                  hide-default-footer
                  :items="other"
                  group-by="group"
                  :footer-props="footer"
                >
                  <template slot="group.header" slot-scope="props">
                    <td v-if="props.group" colspan="6" class="font-weight-bold">
                      <v-icon
                        v-if="props.isOpen"
                        class="my-1 ml-1"
                        @click.stop="props.toggle"
                      >
                        mdi-chevron-down
                      </v-icon>
                      <v-icon
                        v-else
                        class="my-1 ml-1"
                        @click.stop="props.toggle"
                      >
                        mdi-chevron-right
                      </v-icon>
                      {{ props.group }}
                    </td>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h2>Client Grand Total</h2>
                <p>
                  <span>
                    <b> BAU/Caps:</b>
                    {{ dealSum['Client Grand Total']['BAU / Caps'] }}
                  </span>
                  <span>
                    <b> Net Price:</b>
                    {{ dealSum['Client Grand Total']['Net Price'] }}
                  </span>
                  <span>
                    <b> Discount:</b>
                    {{ dealSum['Client Grand Total']['Discount'] }}
                  </span>
                  <span>
                    <b> Cash Flow:</b>
                    {{ dealSum['Client Grand Total']['Cash Flow'] }}
                  </span>
                  <span>
                    <b> SRO Model:</b>
                    {{ dealSum['Client Grand Total']['SRO Model'] }}
                  </span>
                </p>
                <p>
                  <b>+/- Dealmaker Adjustments:</b>
                  <span>
                    {{ dealSum['+/- Dealmaker Adjustment'] }}
                  </span>
                </p>
                <p>
                  <b>Estimated Period Revenue: </b>
                  <span>
                    {{ dealSum['Estimated Period Revenue'] }}
                  </span>
                  <b>
                    Adjusted ({{
                      dealSum['Estimated Period Revenue Currency']
                    }}):
                  </b>
                  <span>{{
                    dealSum['Estimated Period Revenue, Adjusted']
                  }}</span>

                  <b> USD: </b>
                  <span>{{
                    dealSum['Estimated Period Revenue, Adjusted - USD']
                  }}</span>
                </p>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'DealSumTable',
  data: () => ({
    headers: [
      { text: '', value: 'title' },
      { text: 'BAU/Caps', value: 'BAU / Caps' },
      { text: 'Net Price', value: 'Net Price' },
      { text: 'Discount', value: 'Discount' },
      { text: 'Cash Flow', value: 'Cash Flow' },
      { text: 'SRO Model', value: 'SRO Model' }
    ],
    footer: { itemsPerPageOptions: [50, 100, -1] }
  }),
  computed: {
    ...mapState({
      dealSum: state =>
        state.deals.deal.dealSum ? state.deals.deal.dealSum : null
    }),
    show() {
      return !!this.dealSum;
    },
    mlc() {
      return Object.keys(this.dealSum.MLC).reduce((MLC, key) => {
        MLC.push({ ...this.dealSum.MLC[key], title: key });
        return MLC;
      }, []);
    },
    otc() {
      return Object.keys(
        this.dealSum['New OTC (counts toward Qualified OTC)']
      ).reduce((OTC, group) => {
        if (group === 'Subtotal') {
          OTC.push({
            group: '',
            title: group,
            ...this.dealSum['New OTC (counts toward Qualified OTC)'][group]
          });
        } else {
          OTC.push(
            ...Object.keys(
              this.dealSum['New OTC (counts toward Qualified OTC)'][group]
            ).reduce((grouped, title) => {
              grouped.push({
                group,
                title,
                ...this.dealSum['New OTC (counts toward Qualified OTC)'][group][
                  title
                ]
              });
              return grouped;
            }, [])
          );
        }
        return OTC;
      }, []);
    },
    renewals() {
      return Object.keys(this.dealSum['Committed Renewals']).reduce(
        (renewals, group) => {
          renewals.push(
            ...Object.keys(this.dealSum['Committed Renewals'][group]).reduce(
              (grouped, title) => {
                grouped.push({
                  group,
                  title,
                  ...this.dealSum['Committed Renewals'][group][title]
                });
                return grouped;
              },
              []
            )
          );
          return renewals;
        },
        []
      );
    },
    other() {
      const result = [];
      result.push(
        ...Object.keys(this.dealSum.Other).reduce((others, key) => {
          if (key === 'Other SRO Charges') {
            others.push(
              ...Object.keys(this.dealSum.Other[key]).reduce(
                (grouped, title) => {
                  grouped.push({
                    group: key,
                    title,
                    ...this.dealSum.Other[key][title]
                  });
                  return grouped;
                },
                []
              )
            );
          } else {
            others.push({
              group: '',
              title: key,
              ...this.dealSum.Other[key]
            });
          }
          return others;
        }, [])
      );
      return result;
    }
  }
};
</script>
