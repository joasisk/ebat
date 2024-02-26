<template>
  <div>
    <v-card class="mt-6">
      <v-card-title>Geos</v-card-title>
      <!-- TABLE OF GEOS -->
      <v-data-table
        :headers="geoHeaders"
        :items="geos"
        :loading="loading"
        item-key="geo_id"
      >
        <template v-slot:top>
          <v-btn
            absolute
            color="primary"
            dark
            fab
            right
            small
            top
            @click.stop="showAddDialog = true"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn color="red" icon small @click.stop="openDeleteOverlay(item)">
            <v-icon>mdi-delete-circle</v-icon>
          </v-btn>
          <v-btn color="blue" icon small @click.stop="openEditOverlay(item)">
            <v-icon>mdi-pencil-circle</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <!-- DELETE GEO DIALOG -->
    <v-dialog v-model="showDeleteDialog" persistent width="500">
      <v-card>
        <v-card-title primary-title>
          Confirm deletion of Geo
        </v-card-title>
        <v-card-text>
          This actions is going to permanently delete
          <b>{{ geo.name }}</b> geo.
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="hideDialog('delete')">
            Cancel
          </v-btn>
          <v-btn color="red" text @click="deleteGeo">
            Confirm - delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- ADD GEO DIALOG -->
    <v-dialog v-model="showAddDialog" persistent width="500">
      <v-card>
        <v-card-title primary-title>
          Create new GEO
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="geo.name" dense label="GEO" outlined />
          <v-text-field v-model="geo.task_id" dense label="Task ID" outlined />
          <v-text-field
            v-model="geo.annuity_task_id"
            dense
            label="Annuity Task ID"
            outlined
          />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="hideDialog('add')">
            Cancel
          </v-btn>
          <v-btn :disabled="disableSubmit" color="green" text @click="addGeo">
            Create GEO
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- edit dialog -->
    <v-dialog v-model="showEditDialog" persistent width="500">
      <v-card>
        <v-card-title primary-title>
          Update GEO
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editGeo.task_id"
            dense
            label="Task ID"
            outlined
          />
          <v-text-field
            v-model="editGeo.annuity_task_id"
            dense
            label="Annuity Task ID"
            outlined
          />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click.stop="hideDialog('edit')">
            Cancel
          </v-btn>
          <v-btn color="primary" text @click.stop="updateGeo">
            Update GEO
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Geo',

  data: () => ({
    showAddDialog: false,
    showDeleteDialog: false,
    showEditDialog: false,
    geoHeaders: [
      { text: 'GEO', value: 'name' },
      { text: 'Task ID', value: 'task_id' },
      { text: 'Annuity Task ID', value: 'annuity_task_id' },
      { text: 'Actions', value: 'actions', sortable: false, filterable: false }
    ],
    geo: {
      name: '',
      task_id: '',
      annuity_task_id: ''
    },
    editGeo: {
      name: '',
      task_id: '',
      annuity_task_id: '',
      geo_id: null
    }
  }),
  computed: {
    ...mapState({
      geos: state => state.geos.geos,
      loading: state => state.geos.loading
    }),
    disableSubmit() {
      return !(this.geo.name !== '');
    }
  },
  methods: {
    /**
     * Function opens the delete dialog for certain geo
     * @param {object} geo - Geo that should be deleted
     */
    openDeleteOverlay(geo) {
      this.geo = geo;
      this.showDeleteDialog = true;
    },
    openEditOverlay(geo) {
      // eslint-disable-next-line no-unused-vars
      const { is_disabled, ...editGeo } = geo;
      this.editGeo = editGeo;
      this.showEditDialog = true;
    },
    /**
     * Function that hides the dialog window
     * @param {string} dialog - Dialog that should be closed ('delete', 'add', ...)
     */
    hideDialog(dialog) {
      if (dialog === 'add') this.showAddDialog = false;
      if (dialog === 'delete') this.showDeleteDialog = false;
      if (dialog === 'edit') this.showEditDialog = false;
      setTimeout(
        () => (
          (this.geo = {
            name: '',
            task_id: '',
            annuity_task_id: ''
          }),
          (this.editGeo = {
            name: '',
            task_id: '',
            annuity_task_id: '',
            geo_id: null
          })
        ),
        200
      );
    },
    /**
     * Function deletes the chosen geo
     */
    deleteGeo() {
      this.$store.dispatch('geos/removeGeo', this.geo.geo_id);
      this.hideDialog('delete');
    },
    /**
     * Function creates the new geo
     */
    addGeo() {
      this.$store.dispatch('geos/addGeo', this.geo);
      this.hideDialog('add');
    },
    updateGeo() {
      this.$store.dispatch('geos/editGeo', this.editGeo);
      this.showEditDialog = false;
      setTimeout(
        () =>
          (this.editGeo = {
            name: '',
            task_id: '',
            annuity_task_id: '',
            geo_id: null
          }),
        200
      );
    }
  }
};
</script>
