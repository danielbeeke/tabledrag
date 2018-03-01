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
      let rows = event.detail.rows;

      // Do not allow children with parent depth + 2 or more.
      let previousRow = null;
      rows.forEach((row) => {
        if (previousRow && parseInt(previousRow.dataset.depth) <  parseInt(row.dataset.depth) - 1) event.preventDefault();
        previousRow = row;
      });

      // Do not allow the first row to have a depth.
      if (parseInt(rows[0].dataset.depth) !== 0) event.preventDefault();
    });
  }
}