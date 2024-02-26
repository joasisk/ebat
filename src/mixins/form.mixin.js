export default {
  methods: {
    /**
     * opens overlay
     * and adds data to set param - for modify overlays
     *
     * @param {*} overlay overlay to be opened
     * @param {*} [param=null] param to be set
     * @param {*} [data={}] data to set to form part of overlay
     */
    // eslint-disable-next-line no-unused-vars
    openOverlay(overlay, param = null, data) {
      this.form.overlays[overlay].open = true;
      if (param != null) {
        this.form.data[param] = { ...data };
      }
    },

    /**
     * closes overlay and triggers data reset after animation end
     *
     * @param {*} overlay overlay to be closed
     * @param {*} param parameter to be reset
     * @param {*} [cleanData={}] clean data
     */
    // eslint-disable-next-line no-unused-vars
    closeOverlay(overlay, param, cleanData) {
      this.form.overlays[overlay].open = false;

      setTimeout(this.cleanData(param, cleanData), 200);
    },

    /**
     * resets data of the form
     *
     * @param {*} param parameter to modify
     * @param {*} [data={}] data to be set
     */
    cleanData(param, data) {
      const obj = Object.create(data);
      this.form.data[param] = obj;
    },

    /**
     * used for form overlays to push data to an array of same data type
     * then triggers close and clean fn
     *
     * @param {*} overlay overlay to be closed
     * @param {*} param parameter to push data to
     * @param {*} data data to be pushed
     * @param {*} cleanData clean data to reset param
     * @param {*} originParam original param to be cleaned
     */
    confirmProjectOverlay(overlay, param, data, cleanData, originParam) {
      const date = new Date();
      this.form.data[param].push({
        id: date.getTime(),
        ...this.form.data[overlay][data],
        value: this.form.data[overlay].value
      });
      this.$store.dispatch('signings/clearProject', cleanData);
      this.closeOverlay(overlay, originParam, cleanData);
    },

    confirmBatchOverlay(overlay, object = 'batchProjects', param = 'file') {
      this.submitWIP(object, param);
      this.form.overlays[overlay].open = false;
    },

    /**
     * Removes a item from <param> array by <trackBy>
     *
     * @param {String} param array to remove from
     * @param {*} trackBy what param to track what to remove
     * @param {*} value tracked value
     */
    removeItem(param, trackBy, value) {
      this.form.data[param].splice(
        this.form.data[param].findIndex(e => e[trackBy] === value),
        1
      );
    },

    /**
     * used on success action on edit overlays to modify correct data
     *
     * @param {*} overlay Overlay name
     * @param {*} param parameter to copy data from
     * @param {*} originParam parameter to paste data to
     * @param {*} findBy if not null consider origin param as array of obj and find by this param
     * @param {*} cleanData cleaned data for after copy
     */
    confirmEditOverlay(overlay, param, originParam, findBy = null, cleanData) {
      if (findBy != null) {
        const index = this.form.data[originParam].findIndex(e => {
          return e[findBy] === this.form.data[param][findBy];
        });
        this.form.data[originParam].splice(index, 1, {
          ...this.form.data[param]
        });
      } else {
        this.form.data[originParam] = { ...this.form.data[param] };
      }
      this.closeOverlay(overlay, param, cleanData);
    }
  }
};
