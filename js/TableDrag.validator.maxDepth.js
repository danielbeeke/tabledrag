let defaultOptions = {
  max: 5
};

export default class MaxDepth {

  /**
   * Limites the depth to a certain number.
   * @param tableDrag, the class parent.
   * @param options, the options for this validator.
   */
  constructor (tableDrag, options = {}) {
    this.tableDrag = tableDrag;
    this.options = Object.assign(defaultOptions, options);

    this.tableDrag.table.addEventListener('isValidTransition', (event) => {
      event.detail.rows.forEach((row) => {
        if (row.depth > this.options.max) {
          event.preventDefault();
        }
      });
    });
  }
}