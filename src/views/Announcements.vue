<template>
  <v-container fluid pt-3>
    <v-card class="mt-6">
      <v-card-title>Announcements</v-card-title>
      <v-data-table
        :headers="announcementsHeaders"
        :items="announcements"
        item-key="id"
        :loading="loading"
      >
        <template v-slot:top>
          <v-btn
            color="primary"
            dark
            small
            absolute
            top
            right
            fab
            @click.stop="openDialog('Create')"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <template v-slot:item.class="{ item }">
          <v-chip :color="item.class">
            {{ item.class }}
          </v-chip>
        </template>
        <template v-slot:item.start="{ item }">
          {{ formatDate(item.start) }}
        </template>
        <template v-slot:item.end="{ item }">
          {{ formatDate(item.end) }}
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon small color="blue" @click.stop="openDialog('Edit', item)">
            <v-icon>mdi-pencil-box-outline</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click.stop="openDeleteDialog(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <!-- announcement dialog -->
    <v-dialog v-model="showDialog" persistent width="800">
      <v-card>
        <v-card-title primary-title>
          {{ dialogType }} announcement
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-textarea
              v-model="announcement.message"
              dense
              label="Announcement message"
              :rules="[rules.required]"
              outlined
            />
            <v-row>
              <!-- date -->
              <v-col
                ><v-date-picker v-model="dateRange.date" color="main" range />
                <p
                  v-if="dateRangeValidationFails"
                  class="text-left"
                  style="color: red;"
                >
                  Date range is required.
                </p>
              </v-col>
              <!-- time -->
              <v-col>
                <v-select
                  v-model="announcement.class"
                  :items="severityOptions"
                  label="Select severity"
                  item-value="class"
                  :rules="[rules.required]"
                  outlined
                  dense
                >
                </v-select>
                <v-menu
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dateRange.startTime.value"
                      label="Start time"
                      prepend-icon="mdi-clock-time-four-outline"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[rules.required]"
                    />
                  </template>
                  <v-time-picker
                    v-if="menu"
                    v-model="dateRange.startTime.value"
                    full-width
                    format="24hr"
                    value="hh"
                    :allowed-minutes="allowedMinutes"
                    @click:hour="closeTimePicker($event, 'startTime')"
                  />
                </v-menu>
                <v-menu
                  v-model="menuEnd"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="dateRange.endTime.value"
                      label="End time"
                      prepend-icon="mdi-clock-time-four-outline"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[rules.required]"
                    />
                  </template>
                  <v-time-picker
                    v-if="menuEnd"
                    v-model="dateRange.endTime.value"
                    full-width
                    format="24hr"
                    value="hh"
                    :allowed-minutes="allowedMinutes"
                    @click:hour="closeTimePicker($event, 'endTime')"
                  />
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="closeDialog()">
            Cancel
          </v-btn>
          <v-btn
            v-if="dialogType === 'Create'"
            color="green"
            text
            @click="createAnnouncement"
          >
            Create announcement </v-btn
          ><v-btn v-else color="green" text @click="updateAnnouncement">
            Update announcement
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDeleteModal" width="500">
      <v-card>
        <v-card-title>Do you really want to delete this record?</v-card-title>
        <v-card-text>
          Message: {{ deleteItem.message }} <br /><br />
          You can not undo this operation.
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="orange" text @click.stop="deleteAnn()"
            >Yes, delete
          </v-btn>
          <v-btn color="primary" text @click.stop="closeDeleteDialog()"
            >Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import dateFormatter from '@/helpers/dateFormatter';
import validationMixin from '@/mixins/validation.mixin';

const newAnnouncement = {
  class: '',
  message: '',
  start: '',
  end: '',
  createdBy: ''
};

export default {
  name: 'Announcements',

  data: () => ({
    menu: false,
    menuEnd: false,
    showDeleteModal: false,
    deleteItem: {},
    valid: true,
    showDialog: false,
    dialogType: '',
    announcementsHeaders: [
      { text: 'Message', value: 'message' },
      { text: 'Class', value: 'class' },
      { text: 'Start', value: 'start' },
      { text: 'End', value: 'end' },
      { text: 'Author', value: 'createdBy' },
      { text: '', value: 'actions', sortable: false, filterable: false }
    ],
    announcement: {},
    severityOptions: ['info', 'warning', 'error'],
    timeOptionsHours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    timeOptionsLetters: ['AM', 'PM'],
    dateRange: {
      date: [],
      startTime: { number: '', value: '' },
      endTime: { number: '', value: '' }
    },
    rules: {
      required: value => !!value || 'This field is required.'
    }
  }),
  computed: {
    ...mapState({
      loading: state => state.announcements.loading,
      announcements: state => state.announcements.announcements,
      author: state => state.user.primary
    }),
    dateRangeValidationFails() {
      return validationMixin.validateDateRange(this.dateRange.date);
    }
  },
  mounted() {
    this.$store.dispatch('announcements/getAllAnnouncements');
  },
  methods: {
    formatDate(date) {
      return dateFormatter.displayAnnouncementDate(date);
    },
    openDialog(type, announcement = newAnnouncement) {
      this.dialogType = type;
      if (type === 'Edit') {
        this.dateRange = dateFormatter.adaptDateRangeForEdit(
          announcement.start,
          announcement.end
        );
      }
      this.announcement = { ...announcement };
      this.showDialog = true;
    },
    closeDialog() {
      this.showDialog = false;
      this.clearDateRange();
      this.announcement = newAnnouncement;
      this.dialogType = '';
    },
    clearDateRange() {
      this.dateRange = {
        date: [],
        startTime: { number: '', value: '' },
        endTime: { number: '', value: '' }
      };
    },
    createAnnouncement() {
      if (this.$refs.form.validate()) {
        let announcementToCreate = this.announcement;

        this.dateRange.date = dateFormatter.handleDateRange(
          this.dateRange.date
        );

        announcementToCreate.start = dateFormatter.combineDateAndHour(
          this.dateRange.date[0],
          this.dateRange.startTime
        );
        announcementToCreate.end = dateFormatter.combineDateAndHour(
          this.dateRange.date[1],
          this.dateRange.endTime
        );

        this.$store.dispatch(
          'announcements/createAnnouncement',
          announcementToCreate
        );
        this.closeDialog();
      }
    },
    updateAnnouncement() {
      if (this.$refs.form.validate()) {
        let announcementToUpdate = this.announcement;
        announcementToUpdate.createdBy = this.author;

        this.dateRange.date = dateFormatter.handleDateRange(
          this.dateRange.date
        );

        announcementToUpdate.start = dateFormatter.combineDateAndHour(
          this.dateRange.date[0],
          this.dateRange.startTime
        );
        announcementToUpdate.end = dateFormatter.combineDateAndHour(
          this.dateRange.date[1],
          this.dateRange.endTime
        );

        this.$store.dispatch(
          'announcements/updateAnnouncement',
          announcementToUpdate
        );
        this.closeDialog();
      }
    },
    deleteAnn() {
      this.showDeleteModal = false;
      this.$store.dispatch(
        'announcements/invalidateAnnouncement',
        this.deleteItem.id
      );
      this.deleteItem = {};
    },
    openDeleteDialog(item) {
      this.showDeleteModal = true;
      this.deleteItem = item;
    },
    closeDeleteDialog() {
      this.showDeleteModal = false;
      this.deleteItem = {};
    },
    closeTimePicker(v, part) {
      v = v < 10 ? '0' + v : v;
      this.dateRange[part].number = v;
      this.dateRange[part].value = v + ':00';
      this.menu = false;
      this.menuEnd = false;
    },
    allowedMinutes() {
      m => m % 60 === 0;
    }
  }
};
</script>
