import AttributesConnector from './TableDrag.attributesConnector.js';
import Row from './TableDrag.row.js';

let defaultOptions = {
  connector: AttributesConnector
};

export default class TableDrag {

  constructor (table, options = {}) {
    if (!table.tagName || table.tagName !== 'TABLE') {
      throw 'The first parameter must be the table HTML element.';
    }

    this.table = table;
    this.tbody = this.table.querySelector('tbody');
    this.options = Object.assign(defaultOptions, options);

    this.connector = new this.options.connector();
    this.table.classList.add('tabledrag-initiated');

    this.rows = [];
    Array.from(this.tbody.children).forEach((row) => {
      this.rows.push(new Row(row, this));
    });

    this.table.addEventListener('drop', (event) => {
      event.preventDefault();
      console.log(event)
    }, false);
  }

}