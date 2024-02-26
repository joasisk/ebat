import valueGenerators from '@/helpers/valueGenerator';
import formService from '@/services/form.service';
import Vue from 'vue';

const state = {
  formLoading: false,
  form: { rows: [], overlays: {}, data: {} },
  rowIndex: null,
  colIndex: null,
  questionIndex: null,
  selectedOverlay: '',
  isTableSelected: false,
  isColumnSelected: false,
  sectionSelected: false,
  preview: false,
  tool: ''
};

const actions = {
  saveForm({ commit }, form) {
    commit('setFormLoading', true);
    formService.saveForm(form).finally(() => commit('setFormLoading', false));
  },
  async getForm({ commit, dispatch }, data) {
    commit('setFormLoading', true);
    return Promise.resolve(
      formService
        .getForm()
        .then(async r => {
          commit('setForm', r);
          if (data && data.dealmakerMaster)
            r.data.dealmaker = data.dealmakerMaster;
          await dispatch('deals/setDealStructure', r.data, { root: true });
          return r;
        })
        .finally(() => commit('setFormLoading', false))
    );
  },
  async getFormById({ commit }, data) {
    commit('setFormLoading', true);
    return Promise.resolve(
      formService
        .getFormById(data.id)
        .then(async r => {
          commit('setForm', r);
          if (data.dealmakerMaster) r.data.dealmaker = data.dealmakerMaster;
          return r;
        })
        .finally(() => commit('setFormLoading', false))
    );
  },
  // overhead
  togglePreview({ commit, dispatch }) {
    commit('togglePreview');
    dispatch('resetSelection');
  },
  resetSelection({ commit }) {
    commit('resetSelection');
  },
  changeTool({ commit }, tool) {
    commit('changeTool', tool);
  },
  // ROW
  addRow({ commit }, ri) {
    commit('addRow', ri);
    commit('changeTool', '');
  },
  // questionSection
  addquestionSection({ commit }, ri) {
    commit('addquestionSection', ri);
    commit('changeTool', '');
  },
  selectquestionSection({ commit }, ri) {
    commit('changeTool', '');
    commit('selectquestionSection', ri);
  },
  updatequestionSectionLabel({ commit }, label) {
    commit('updatequestionSectionLabel', label);
  },
  updatequestionSectionValue({ commit }, { newValueName, oldValueName }) {
    commit('updatequestionSectionValue', { newValueName, oldValueName });
  },
  updateSectionCount({ commit }, count) {
    commit('updateSectionCount', count);
  },
  toggleSectionHasText({ commit }) {
    commit('toggleSectionHasText');
  },
  toggleSectionHasFile({ commit }) {
    commit('toggleSectionHasFile');
  },
  toggleSectionHasComments({ commit }) {
    commit('toggleSectionHasComments');
  },
  toggleSectionRequiresApproval({ commit }) {
    commit('toggleSectionRequiresApproval');
  },
  deletequestionSection({ commit }) {
    commit('deletequestionSection');
  },
  // COLUMN
  chooseColumn({ commit }, { ri, ci }) {
    if (
      state.rowIndex === ri &&
      state.colIndex === ci &&
      state.isColumnSelected
    ) {
      return commit('resetSelection');
    }
    commit('changeTool', '');
    commit('chooseColumn', { ri, ci });
  },
  addCol({ commit }, indexes) {
    commit('addCol', indexes);
    commit('changeTool', '');
  },
  updateColumnTitle({ commit }, title) {
    commit('updateColumnTitle', title);
  },
  updateColumnValue({ commit }, { oldVal, newVal }) {
    commit('updateColumnValue', { oldVal, newVal });
  },
  updateColumnWidth({ commit }, width) {
    commit('updateColumnWidth', width);
  },
  updateColumnAccess({ commit }, access) {
    commit('updateColumnAccess', access);
  },
  deleteColumn({ commit }) {
    commit('deleteColumn');
  },
  // QUESTION
  chooseQuestion({ commit }, { ri, ci, qi }) {
    if (
      state.rowIndex === ri &&
      state.colIndex === ci &&
      state.questionIndex === qi
    ) {
      return commit('resetSelection');
    }
    commit('changeTool', '');
    commit('chooseQuestion', { ri, ci, qi });
  },
  chooseOverlayQuestion({ commit }, { overlay, qi }) {
    if (overlay === state.selectedOverlay && qi === state.questionIndex) {
      return commit('resetSelection');
    }
    commit('changeTool', '');
    commit('chooseOverlayQuestion', { overlay, qi });
  },
  addQuestion({ commit }, indexes) {
    commit('addQuestion', indexes);
    commit('changeTool', '');
  },
  updateQuestionLabel({ commit }, label) {
    commit('updateQuestionLabel', label);
  },
  updateValue({ commit }, { newValueName, oldValueName, isArray }) {
    commit('updateValue', { newValueName, oldValueName, isArray });
  },
  updateQuestionType({ commit }, { type, empty, value }) {
    commit('updateQuestionType', { type, empty, value });
  },
  updateSelectType({ commit }, value) {
    commit('updateSelectType', value);
  },
  updateSelectItems({ commit }, items) {
    commit('updateSelectItems', items);
  },
  toggleAutopopulate({ commit }) {
    commit('toggleAutopopulate');
  },
  toggleRequired({ commit }) {
    commit('toggleRequired');
  },
  updateAutopopulateConfig({ commit }, config) {
    commit('updateAutopopulateConfig', config);
  },
  updateRequiredIf({ commit }) {
    commit('updateRequiredIf');
  },
  updateRequiredIfField({ commit }, field) {
    commit('updateRequiredIfField', field);
  },
  updateRequiredValue({ commit }, value) {
    commit('updateRequiredValue', value);
  },
  toggleConditionShow({ commit }) {
    commit('toggleConditionShow');
  },
  updateHint({ commit }, value) {
    commit('updateHint', value);
  },
  deleteQuestion({ commit }) {
    commit('deleteQuestion');
  },
  // TABLE
  chooseTable({ commit }, { ri, ci }) {
    if (
      state.rowIndex === ri &&
      state.colIndex === ci &&
      state.isTableSelected
    ) {
      return commit('resetSelection');
    }
    commit('changeTool', '');
    commit('chooseTable', { ri, ci });
  },
  addTable({ commit }, indexes) {
    const tableName = 'table-' + valueGenerators.randstr({ length: 10 });
    const tableOverlayValue = tableName + '-overlay-values';
    commit('addTable', { ...indexes, tableName });
    commit('addTableOverlay', { ...indexes, tableName, tableOverlayValue });
    commit('changeTool', '');
  },
  updateTableName({ commit }, newValue) {
    commit('updateValue', {
      newValueName: newValue,
      oldValueName:
        state.form.rows[state.rowIndex].columns[state.colIndex].table.rows,
      isArray: true
    });
    commit('updateTableName', newValue);
  },
  addTableHeader({ commit }, { header, index }) {
    commit('addTableHeader', { header, index });
  },
  removeTableHeader({ commit }, index) {
    commit('removeTableHeader', index);
  },
  updateTableHeader({ commit }, { index, header }) {
    commit('updateTableHeader', { index, header });
  },
  toggleSearchable({ commit }) {
    commit('toggleSearchable');
  },
  toggleSortable({ commit }) {
    commit('toggleSortable');
  },
  toggleLinEdit({ commit }) {
    commit('toggleLinEdit');
  },
  toggleLineDelete({ commit }) {
    commit('toggleLineDelete');
  },
  addTableOverlayQuestion({ commit }, payload) {
    commit('addTableOverlayQuestion', payload);
  },
  updateTableOverlayQuestion({ commit }, payload) {
    commit('updateTableOverlayQuestion', payload);
  },
  removeTableOverlayQuestion({ commit }, payload) {
    commit('removeTableOverlayQuestion', payload);
  },
  deleteTable({ commit }) {
    commit('deleteTable');
  },
  // OVERLAYS
  setOverlayOpenState({ commit }, { overlay, open }) {
    commit('setOverlayOpenState', { overlay, open });
  }
};
//  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//  ################# mutations ##########################
//  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
const mutations = {
  setFormLoading(state, loading) {
    state.formLoading = loading;
  },
  setForm(state, form) {
    state.form = form;
    state.formLoading = false;
  },
  //overhead ################
  changeTool(state, tool) {
    state.tool = state.tool === tool ? '' : tool;
  },
  togglePreview(state) {
    state.preview = !state.preview;
    if (state.preview) {
      state.tool = '';
    }
  },
  resetSelection(state) {
    state.rowIndex = null;
    state.colIndex = null;
    state.questionIndex = null;
    state.isColumnSelected = false;
    state.isTableSelected = false;
    state.sectionSelected = false;
    state.selectedOverlay = '';
  },
  // ROW ###########################

  addRow(state, ri) {
    state.form.rows.splice(ri, 0, { columns: [] });
  },

  // section question ##################
  addquestionSection(state, ri) {
    const title = 'Section ' + valueGenerators.randstr({ length: 5 });
    const valueKey = valueGenerators.generateValueName(title);
    Vue.set(state.form.rows[ri], 'questionSection', {
      title,
      value: valueKey,
      maxCount: 1,
      hasText: false,
      hasFile: false,
      hasComments: false,
      requiresApproval: false
    });
    Vue.set(state.form.data, valueKey, []);
  },
  selectquestionSection(state, ri) {
    if (state.sectionSelected) {
      state.sectionSelected = false;
      state.rowIndex = null;
      return;
    }
    state.rowIndex = ri;
    state.colIndex = null;
    state.questionIndex = null;
    state.isColumnSelected = false;
    state.isTableSelected = false;
    state.sectionSelected = true;
    state.selectedOverlay = '';
  },
  updateSectionCount(state, count) {
    state.form.rows[state.rowIndex].questionSection.maxCount = count;
  },
  updatequestionSectionLabel(state, label) {
    state.form.rows[state.rowIndex].questionSection.title = label;
  },
  updatequestionSectionValue(state, { oldValueName, newValueName }) {
    // update value in questionSection
    state.form.rows[state.rowIndex].questionSection.value = newValueName;
    // update data key and delete old key
    Vue.set(state.form.data, newValueName, []);
    delete state.form.data[oldValueName];
  },
  toggleSectionHasText(state) {
    state.form.rows[state.rowIndex].questionSection.hasText = !state.form.rows[
      state.rowIndex
    ].questionSection.hasText;
  },
  toggleSectionHasFile(state) {
    state.form.rows[state.rowIndex].questionSection.hasFile = !state.form.rows[
      state.rowIndex
    ].questionSection.hasFile;
  },
  toggleSectionHasComments(state) {
    state.form.rows[state.rowIndex].questionSection.hasComments = !state.form
      .rows[state.rowIndex].questionSection.hasComments;
  },
  toggleSectionRequiresApproval(state) {
    state.form.rows[state.rowIndex].questionSection.requiresApproval = !state
      .form.rows[state.rowIndex].questionSection.requiresApproval;
  },
  deletequestionSection(state) {
    // delete data key
    delete state.form.data[
      state.form.rows[state.rowIndex].questionSection.value
    ];
    // delete question
    delete state.form.rows[state.rowIndex].questionSection;
  },

  // COLUMN #######################
  chooseColumn(state, { ri, ci }) {
    state.rowIndex = ri;
    state.colIndex = ci;
    state.questionIndex = null;
    state.isColumnSelected = true;
    state.isTableSelected = false;
    state.preview = false;
    state.sectionSelected = false;
    state.selectedOverlay = '';
  },
  addCol(state, { ri, ci }) {
    const colName = 'Column ' + valueGenerators.randstr({ length: 5 });
    const colCommentsValue = valueGenerators.generateValueName(colName);
    state.form.rows[ri].columns.splice(ci, 0, {
      title: colName,
      color: 'grey',
      width: 'auto',
      questions: [],
      table: {
        hasTable: false,
        headers: [],
        rows: '',
        sortable: true,
        searchable: false,
        entryEditable: false,
        entryRemovable: false
      },
      access: [],
      comments: colCommentsValue
    });
    // adds comments array
    Vue.set(state.form.data, colCommentsValue, { comments: [], reviews: [] });
  },
  updateColumnTitle(state, title) {
    state.form.rows[state.rowIndex].columns[state.colIndex].title = title;
  },
  updateColumnValue(state, { oldVal, newVal }) {
    state.form.rows[state.rowIndex].columns[state.colIndex].comments = newVal;

    Vue.set(state.form.data, newVal, {});
    delete state.form.data[oldVal];
  },
  updateColumnWidth(state, width) {
    state.form.rows[state.rowIndex].columns[state.colIndex].width = width;
  },
  updateColumnAccess(state, access) {
    state.form.rows[state.rowIndex].columns[state.colIndex].access = access;
  },
  deleteColumn(state) {
    state.form.rows[state.rowIndex].columns.splice(state.colIndex, 1);
    state.rowIndex = null;
    state.colIndex = null;
    state.isColumnSelected = false;
  },
  // QUESTION
  chooseQuestion(state, { ri, ci, qi }) {
    state.rowIndex = ri;
    state.colIndex = ci;
    state.questionIndex = qi;
    state.isColumnSelected = false;
    state.isTableSelected = false;
    state.sectionSelected = false;
    state.preview = false;
    state.selectedOverlay = '';
  },
  chooseOverlayQuestion(state, { overlay, qi }) {
    state.selectedOverlay = overlay;
    state.questionIndex = qi;
    state.rowIndex = null;
    state.colIndex = null;
    state.isColumnSelected = false;
    state.isTableSelected = false;
    state.preview = false;
  },
  addQuestion(state, { ri, ci, qi }) {
    const NEW_QUESTION_NAME =
      'New Question ' + valueGenerators.randstr({ length: 5 });
    const VALUE = valueGenerators.generateValueName(NEW_QUESTION_NAME);
    const newQuestion = {
      label: NEW_QUESTION_NAME,
      value: VALUE,
      type: 'text',
      validation: {
        required: {
          required: false,
          if: false,
          field: '',
          value: '',
          show: false
        }
      },
      config: {
        select: { type: '', items: '' },
        autopopulate: {
          autopopulate: false,
          generatorHandler: { handler: '' }
        },
        hint: ''
      }
    };
    Vue.set(state.form.data, VALUE, '');
    state.form.rows[ri].columns[ci].questions.splice(qi, 0, newQuestion);
  },
  updateQuestionLabel(state, label) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].label = label;
  },
  updateValue(state, { newValueName, oldValueName, isArray }) {
    //  update value key / table rows key
    if (state.form.data[oldValueName] != undefined) {
      Vue.set(state.form.data, newValueName, state.form.data[oldValueName]);
      delete state.form.data[oldValueName];
    } else {
      Vue.set(state.form.data, newValueName, isArray ? [] : '');
    }
    if (!isArray) {
      state.form.rows[state.rowIndex].columns[state.colIndex].questions[
        state.questionIndex
      ].value = newValueName;
    }
    // table question only
    if (isArray) {
      // rename overlay
      Vue.set(state.form.overlays, newValueName, {
        ...state.form.overlays[oldValueName]
      });
      delete state.form.overlays[oldValueName];

      const TITLE = `Add ${newValueName} entry`;
      const OVERLAY_VALUE_KEY = `${newValueName}-overlay-values`;
      const ROWS = newValueName;
      // update table title depending values in overlay
      state.form.overlays[newValueName].title = TITLE;
      state.form.overlays[newValueName].value = OVERLAY_VALUE_KEY;
      // update overlay buttons config
      state.form.overlays[newValueName].actions[0].click.overlay = ROWS;
      state.form.overlays[
        newValueName
      ].actions[0].click.parameter = OVERLAY_VALUE_KEY;
      state.form.overlays[newValueName].actions[1].click.overlay = ROWS;
      state.form.overlays[newValueName].actions[1].click.parameter = ROWS;
      state.form.overlays[
        newValueName
      ].actions[1].click.value = OVERLAY_VALUE_KEY;
      // update overlay data value
      const OLD_OVERLAY_VALUE_KEY = `${oldValueName}-overlay-values`;
      if (state.form.data[OLD_OVERLAY_VALUE_KEY]) {
        // if there are already some keys inside copy them
        Vue.set(state.form.data, OVERLAY_VALUE_KEY, {
          ...state.form.data[OLD_OVERLAY_VALUE_KEY]
        });
        delete state.form.data[OLD_OVERLAY_VALUE_KEY];
      } else {
        // in case of no headers just generate new
        Vue.set(state.form.data, OVERLAY_VALUE_KEY, {});
      }
      // update top action params
      state.form.rows[state.rowIndex].columns[
        state.colIndex
      ].topAction.actions[0].click.overlay = ROWS;
      state.form.rows[state.rowIndex].columns[
        state.colIndex
      ].topAction.actions[0].click.parameter = OVERLAY_VALUE_KEY;
    }
  },
  updateQuestionType(state, { type, empty, value }) {
    // in case of table overlay question update
    if (state.selectedOverlay != '') {
      // update empty value based on type
      state.form.data[state.form.overlays[state.selectedOverlay].value][
        value
      ] = empty;
      // update question type
      state.form.overlays[state.selectedOverlay].questions[
        state.questionIndex
      ].type = type;
      return;
    }
    state.form.data[value] = empty;
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].type = type;
  },
  updateSelectType(state, value) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].config.select.type = value;
  },
  updateSelectItems(state, items) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].config.select.items = items;
  },
  toggleAutopopulate(state) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].config.autopopulate.autopopulate = !state.form.rows[state.rowIndex]
      .columns[state.colIndex].questions[state.questionIndex].config
      .autopopulate.autopopulate;
  },
  toggleRequired(state) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].validation.required.required = !state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].questions[state.questionIndex].validation.required.required;
  },
  updateRequiredIf(state) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].validation.required.if = !state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].questions[state.questionIndex].validation.required.if;
  },
  updateRequiredIfField(state, field) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].validation.required.field = field;
  },
  updateRequiredValue(state, value) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].validation.required.value = value;
  },
  updateAutopopulateConfig(state, config) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].config.autopopulate = config;
  },
  toggleConditionShow(state) {
    state.form.rows[state.rowIndex].columns[state.colIndex].questions[
      state.questionIndex
    ].validation.required.show = state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].questions[state.questionIndex].validation.required.show
      ? false
      : true;
  },
  updateHint(state, value) {
    // if hint key is present update it else set key
    if (
      state.form.rows[state.rowIndex].columns[state.colIndex].questions[
        state.questionIndex
      ].config.hint
    ) {
      state.form.rows[state.rowIndex].columns[state.colIndex].questions[
        state.questionIndex
      ].config.hint = value;
    } else {
      Vue.set(
        state.form.rows[state.rowIndex].columns[state.colIndex].questions[
          state.questionIndex
        ].config,
        'hint',
        value
      );
    }
  },
  deleteQuestion(state) {
    if (
      state.rowIndex == null &&
      state.colIndex == null &&
      state.questionIndex == null
    ) {
      return;
    }
    state.form.rows[state.rowIndex].columns[state.colIndex].questions.splice(
      state.questionIndex,
      1
    );
    state.rowIndex = null;
    state.colIndex = null;
    state.questionIndex = null;
  },
  // TABLE
  chooseTable(state, { ri, ci }) {
    state.rowIndex = ri;
    state.colIndex = ci;
    state.questionIndex = null;
    state.isColumnSelected = false;
    state.isTableSelected = true;
    state.preview = false;
    state.sectionSelected = false;
    state.selectedOverlay = '';
  },
  addTable(state, { ri, ci, tableName }) {
    if (state.form.rows[ri].columns[ci].questions.length == 0) {
      state.form.rows[ri].columns[ci].table.hasTable = true;
      state.form.rows[ri].columns[ci].table.rows = tableName;
      // crate value array for table rows
      Vue.set(state.form.data, tableName, []);
    }
  },
  addTableOverlay(state, { ri, ci, tableName, tableOverlayValue }) {
    // add overlay
    if (Array.isArray(state.form.overlays)) {
      state.form.overlays = {};
    }
    Vue.set(state.form.overlays, tableName, {
      open: false,
      title: 'Add ' + tableName + ' entry',
      value: tableOverlayValue,
      questions: [],
      actions: [
        {
          label: 'cancel',
          click: {
            action: 'closeOverlay',
            overlay: tableName,
            parameter: tableOverlayValue,
            empty: {}
          }
        },
        {
          label: 'add',
          color: 'green',
          click: {
            action: 'confirmAddTableOverlay', // TODO: create fn - modify confirmProjectOverlay
            overlay: tableName,
            parameter: tableName,
            value: tableOverlayValue,
            originParam: tableOverlayValue,
            empty: {}
          },
          config: {}
        }
      ]
    });
    // create value for overlay questions
    Vue.set(state.form.data, tableOverlayValue, {});
    // add top actions
    Vue.set(state.form.rows[ri].columns[ci], 'topAction', {
      color: 'blue',
      icon: 'mdi-plus',
      small: true,
      actions: [
        {
          color: 'green',
          icon: 'mdi-plus',
          small: true,
          emit: 'addItem',
          fab: false,
          rounded: true,
          text: 'Add Item',
          click: {
            action: 'openOverlay',
            overlay: tableName,
            parameter: tableOverlayValue,
            data: {}
          }
        }
      ]
    });
  },
  deleteTable(state) {
    const value =
      state.form.rows[state.rowIndex].columns[state.colIndex].table.rows;
    // remove overlay
    delete state.form.overlays[value];
    // remove topAction
    delete state.form.rows[state.rowIndex].columns[state.colIndex].topAction;

    // delete value containing table rows
    delete state.form.data[value];
    // delete overlay values
    delete state.form.data[value + '-overlay-values'];
    // delete value containing add table line overlay question values
    state.form.rows[state.rowIndex].columns[state.colIndex].table = {
      hasTable: false,
      headers: [],
      rows: '',
      sortable: true,
      searchable: false,
      entryEditable: false,
      entryRemovable: false
    };
    state.colIndex = null;
    state.rowIndex = null;
    state.isTableSelected = false;
  },
  updateTableName(state, newValue) {
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.rows = newValue;
  },
  addTableHeader(state, { header, index }) {
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.headers.splice(index, 0, header);
  },
  removeTableHeader(state, index) {
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.headers.splice(index, 1);
  },
  updateTableHeader(state, { index, header }) {
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.headers.splice(index, 1, header);
  },
  addTableOverlayQuestion(state, { overlay, index, header }) {
    // add question to overlay
    state.form.overlays[overlay].questions.splice(index, 0, {
      label: header.text,
      value: header.value,
      type: 'text',
      validation: [
        {
          type: 'required',
          rule: {
            required: false
          }
        }
      ],
      config: {
        select: {
          type: '',
          items: ''
        },
        autopopulate: {
          autopopulate: false
        }
      }
    });
    // add value to overlay values
    Vue.set(state.form.data[`${overlay}-overlay-values`], header.value, '');
    // update overlay actions empty objects
    state.form.overlays[overlay].actions.forEach(action => {
      action.click.empty = { ...action.click.empty, [header.value]: '' };
    });
    // update top action empty data
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].topAction.actions.forEach(action => {
      action.click.data = { ...action.click.data, [header.value]: '' };
    });
  },
  updateTableOverlayQuestion(state, { overlay, index, header, oldValueName }) {
    // update question title and value
    state.form.overlays[overlay].questions[index].label = header.text;
    state.form.overlays[overlay].questions[index].value = header.value;
    // update value keys in overlay value
    Vue.set(
      state.form.data[`${overlay}-overlay-values`],
      header.value,
      state.form.data[`${overlay}-overlay-values`][oldValueName]
    );
    delete state.form.data[`${overlay}-overlay-values`][oldValueName];
    // update overlay actions empty objects
    state.form.overlays[overlay].actions.forEach(action => {
      Vue.set(
        action.click.empty,
        header.value,
        action.click.empty[oldValueName]
      );
      delete action.click.empty[oldValueName];
    });
    // update top action empty data
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].topAction.actions.forEach(action => {
      Vue.set(action.click.data, header.value, action.click.data[oldValueName]);
      delete action.click.data[oldValueName];
    });
  },
  removeTableOverlayQuestion(state, { overlay, index, header }) {
    // remove question to overlay
    state.form.overlays[overlay].questions.splice(index, 1);
    // remove value to overlay values
    delete state.form.data[`${overlay}-overlay-values`][header];
    // remove overlay actions empty objects
    state.form.overlays[overlay].actions.forEach(action => {
      delete action.click.empty[header];
    });
    // update top action empty data
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].topAction.actions.forEach(action => {
      delete action.click.data[header];
    });
  },
  toggleSearchable(state) {
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.searchable = !state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.searchable;
  },
  toggleSortable(state) {
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.sortable = !state.form.rows[state.rowIndex].columns[state.colIndex]
      .table.sortable;
  },
  toggleLinEdit(state) {
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.entryEditable = !state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.entryEditable;
  },
  toggleLineDelete(state) {
    state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.entryRemovable = !state.form.rows[state.rowIndex].columns[
      state.colIndex
    ].table.entryRemovable;
  },
  //OVERLAYS
  setOverlayOpenState(state, { overlay, open }) {
    state.form.overlays[overlay].open = open;
  }
};

export const form = {
  namespaced: true,
  state,
  actions,
  mutations
};
