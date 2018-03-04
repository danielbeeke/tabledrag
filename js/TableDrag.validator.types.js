let defaultOptions = {
  nestable: {},
  attributeName: 'type'
};

export default class Types {

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
      rows.forEach((row) => {
        let rowType = row.dataset[this.options.attributeName];

        let parents = event.detail.tableDrag.getParents(event.detail.simulatedTbody, row.dataset.id);
        if (parents.length) {
          let directParent = parents[0];
          let parentType = directParent.dataset[this.options.attributeName];

          if (!this.options.nestable[rowType].includes(parentType)) {
            event.preventDefault();
          }
        }
      });
    });
  }
}