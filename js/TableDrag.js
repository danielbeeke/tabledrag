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

    this.table.addEventListener('dragover', (event) => this.dragOver(event), false);

    this.rows = [];
    Array.from(this.tbody.children).forEach((row) => {
      this.rows.push(new Row(row, this));
    });
  }

  /**
   * We check if the dragging must put the dragged row above or below the place it is currently being dragged over.
   *
   * @param event Drag event.
   */
  dragOver (event) {
    event.preventDefault();

    let tableRowId = event.dataTransfer.getData('tableRow');
    let draggedRow = this.getRowById(tableRowId);

    let filteredRowAbove = this.rows.find((row) => row.rect.top < event.pageY && row.rect.top + (row.rect.height / 2) > event.pageY);
    let filteredRowBelow = this.rows.find((row) => row.rect.top + (row.rect.height / 2) < event.pageY && row.rect.top + row.rect.height > event.pageY);

    if (filteredRowAbove && draggedRow !== filteredRowAbove) {
      this.tbody.insertBefore(draggedRow.element, filteredRowAbove.element);
      this.rows.forEach((row) => row.calculateRect());
    }

    if (filteredRowBelow && draggedRow !== filteredRowBelow) {
      this.tbody.insertBefore(draggedRow.element, filteredRowBelow.element.nextElementSibling);
      this.rows.forEach((row) => row.calculateRect());
    }
  }


  getRowById (id) {
    return this.rows.find((row) => row.id === parseInt(id));
  }

  getRowByElement (element) {
    return this.rows.find((row) => row.element === element);
  }
}