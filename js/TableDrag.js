import Row from './TableDrag.row.js';

/**
 * Defaults for the tableDrag.
 */
let defaultOptions = {
  dragCssClass: 'is-dragged',
  nestingDragDistance: 60
};

export default class TableDrag {

  /**
   *
   * @param table, the HTML table element.
   * @param options, overrides on the defaultOptions object.
   */
  constructor (table, options = {}) {
    if (!table.tagName || table.tagName !== 'TABLE') throw 'The first parameter must be the table HTML element.';
    if (typeof options !== 'object') throw 'The second parameter must be an object.';

    this.table = table;
    this.options = Object.assign(defaultOptions, options);
    this.tbody = this.table.querySelector('tbody');
    this.table.classList.add('tabledrag-initiated');
    this.table.addEventListener('dragover', (event) => this.dragOver(event), false);
    this.rows = Array.from(this.tbody.children).map(row => new Row(row, this));
  }

  getElementInTbodyById (tbody, id) {
    return Array.from(tbody.children).find(row => row.dataset.id === id);
  }

  /**
   * When dragging, the reactions are saved in functions as an operation.
   * This operation is simulated on a copy of the table.
   * That table is converted to an array that will be validated and
   * if validated by the implementation of the plugin the operations are run again but this time on the real table.
   *
   * @param event Drag event.
   */
  dragOver (event) {
    event.preventDefault();

    let operations = [];
    let draggedRowId = event.dataTransfer.getData('tableRowId');
    let draggedRow = this.getRowById(draggedRowId);
    let clonedTbody = this.tbody.cloneNode(true);
    let startX = parseInt(event.dataTransfer.getData('tableRowStartX'));
    let startDepth = parseInt(event.dataTransfer.getData('tableRowStartDepth'));
    let children = JSON.parse(event.dataTransfer.getData('tableRowChildren'));

    let moveChildrenAlong = (tbody, lastUsedRow) => {
      children.forEach((childData) => {
        let childElement = this.getElementInTbodyById(tbody, childData.id);
        tbody.insertBefore(childElement, lastUsedRow.nextElementSibling);
        lastUsedRow = childElement;
      });
    };

    let touchingRowAbove = this.rows.find((row) => row.rect.top < event.pageY &&
      row.rect.top + (row.rect.height / 2) > event.pageY);

    if (touchingRowAbove && draggedRow !== touchingRowAbove) {
      operations.push((tbody) => {
        let draggedRowElement = this.getElementInTbodyById(tbody, draggedRowId);
        let touchingRowAboveElement = this.getElementInTbodyById(tbody, touchingRowAbove.element.dataset.id);
        tbody.insertBefore(draggedRowElement, touchingRowAboveElement);
        moveChildrenAlong(tbody, draggedRowElement);
      });
    }

    let touchingRowBelow = this.rows.find((row) => row.rect.top + (row.rect.height / 2) < event.pageY &&
      row.rect.top + row.rect.height > event.pageY);

    if (touchingRowBelow && draggedRow !== touchingRowBelow) {
      operations.push((tbody) => {
        let draggedRowElement = this.getElementInTbodyById(tbody, draggedRowId);
        let touchingRowBelowElement = this.getElementInTbodyById(tbody, touchingRowBelow.element.dataset.id);
        tbody.insertBefore(draggedRowElement, touchingRowBelowElement.nextElementSibling);
        moveChildrenAlong(tbody, draggedRowElement);
      });
    }

    let times = Math.floor((event.pageX - startX) / this.options.nestingDragDistance);

    if (startDepth + times >= 0) {
      operations.push((tbody) => {
        let draggedRowElement = this.getElementInTbodyById(tbody, draggedRowId);
        draggedRowElement.dataset.depth = startDepth + times;
        children.forEach((childData) => {
          let childElement = this.getElementInTbodyById(tbody, childData.id);
          childElement.dataset.depth = parseInt(childData.depth) + times;
        });
      });
    }

    operations.push((tbody) => {
      this.rows.forEach((row) => row.postTransition());
      Array.from(tbody.children).forEach((row, delta) => row.dataset.weight = delta + 1);
    });

    operations.forEach((operation) => operation(clonedTbody));

    if (this.isValidTransition(clonedTbody)) {
      operations.forEach((operation) => operation(this.tbody));
    }
  }

  /**
   * Dispatches the isValidTransition event.
   * @param simulatedTbody
   * @returns {boolean}
   */
  isValidTransition (simulatedTbody) {
    let validateEvent = new CustomEvent('isValidTransition', {
      cancelable: true,
      detail: {
        rows: Array.from(simulatedTbody.children).map(row => Object.assign({}, row.dataset)),
      }
    });

    this.table.dispatchEvent(validateEvent);
    return !validateEvent.defaultPrevented;
  }

  /**
   * Returns a row by ID.
   * @param id
   * @returns {*}
   */
  getRowById (id) {
    return this.rows.find((row) => row.element.dataset.id === id);
  }
}