<template>
  <div class="table-wrap">
    <div v-if="searchable" class="search-wrap">
      <v-text-field
        dense
        :disabled="!preview"
        :label="preview ? 'Search' : 'table search is enabled'"
        append-icon="mdi-magnify"
      />
    </div>
    <div
      class="table-question"
      :class="{ selected: selected }"
      @click="
        $store.dispatch('form/chooseTable', { ri: rowIndex, ci: colIndex })
      "
    >
      <div class="fake-header">
        <span v-for="header in tableHeaders" :key="header.value">
          {{ header.text }}
          <v-icon v-if="sortable">mdi-menu-down</v-icon>
        </span>
        <span v-if="hasLineActions">Actions</span>
      </div>
      <div class="fake-body">Table data will appear here.</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'TableQuestion',
  props: {
    tableHeaders: {
      type: Array,
      default: () => []
    },
    preview: {
      type: Boolean,
      default: false
    },
    rowIndex: {
      type: [Number, null],
      default: null
    },
    colIndex: {
      type: [Number, null],
      default: null
    },
    hasLineActions: {
      type: Boolean,
      default: false
    },
    sortable: {
      type: Boolean,
      default: true
    },
    searchable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      isTableSelected: state => state.form.isTableSelected,
      ri: state => state.form.rowIndex,
      ci: state => state.form.colIndex
    }),
    selected() {
      return (
        this.isTableSelected &&
        this.ri === this.rowIndex &&
        this.ci === this.colIndex
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.table-wrap {
  position: relative;
  padding-top: 2rem;
  margin-top: -1rem;

  .search-wrap {
    margin-right: 4rem;
  }

  .table-question {
    cursor: pointer;

    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    &.selected {
      box-shadow: inset 0px 0px 5px #ffd600;
      box-shadow: 0px 0px 5px #ffd600;
      border-radius: 4px;
    }

    .fake-header {
      display: flex;
      width: 100%;
      border-bottom: #393939 1px solid;

      span {
        flex-grow: 1;
        padding: 0.5rem;
      }
    }

    .fake-body {
      padding: 0.5rem;
    }
  }
}

.theme--light {
  .table-wrap {
    .table-question {
      background-color: #b8b7b7;
    }
  }
}
.theme--dark {
  .table-wrap {
    .table-question {
      background-color: #1e1e1e;
    }
  }
}
</style>
