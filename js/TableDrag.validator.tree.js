let defaultOptions = {

};

export default class Tree {

  /**
   * Validates if each item in the three has a parent.
   * @param tableDrag, the class parent.
   * @param options, the options for this validator.
   */
  constructor (tableDrag, options = {}) {
    this.tableDrag = tableDrag;
    this.options = Object.assign(defaultOptions, options);

    this.tableDrag.table.addEventListener('isValidTransition', (event) => {
      let previousRow = null;
      event.detail.rows.forEach((row) => {
        if (previousRow) {
          if (previousRow.depth <  row.depth - 1) {
            event.preventDefault();
          }
        }

        previousRow = row;
      });

      if (event.detail.rows[0].depth !== 0) {
        event.preventDefault();
      }
    });
  }
}