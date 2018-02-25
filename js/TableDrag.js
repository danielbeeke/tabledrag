import AttributesConnector from './TableDrag.attributesConnector.js';
import Row from './TableDrag.row.js';

let defaultOptions = {
  connector: AttributesConnector,
  dragCssClass: 'is-dragged',
  nestingDragDistance: 60
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

  setStartDepths () {
    this.rows.forEach((row) => {
      row.startDepth = row.data.depth;
    });
  }

  unsetStartDepths () {
    this.rows.forEach((row) => {
      row.startDepth = null;
    });
  }

  /**
   * We check if the dragging must put the dragged row above or below the place it is currently being dragged over.
   *
   * @param event Drag event.
   */
  dragOver (event) {
    event.preventDefault();

    let tableData = this.toData();
    let cleanTableData = this.toData();
    let operations = [];

    let tableRowId = event.dataTransfer.getData('tableRow');
    let draggedRow = this.getRowById(tableRowId);
    let currentTableDataRow = tableData.find((row) => row.id === draggedRow.data.id);

    /**
     * Horizontal movement.
     */

    let times = Math.floor((event.pageX - draggedRow.startX) / this.options.nestingDragDistance);

    // Indenting
    if (draggedRow.data.depth !== draggedRow.startDepth + times && draggedRow.startDepth + times >= 0) {
      let children = this.getChildrenOfRow(draggedRow);
      children.forEach((childRow) => {
        operations.push(() => {
          childRow.data.depth = childRow.startDepth + times;
        });
      });

      operations.push(() => {
        draggedRow.data.depth = draggedRow.startDepth + times;
      });
    }

    /**
     * vertical movement.
     */
    let filteredRowAbove = this.rows.find((row) => row.rect.top < event.pageY && row.rect.top + (row.rect.height / 2) > event.pageY);
    let filteredRowBelow = this.rows.find((row) => row.rect.top + (row.rect.height / 2) < event.pageY && row.rect.top + row.rect.height > event.pageY);

    if (filteredRowAbove && draggedRow !== filteredRowAbove) {
      currentTableDataRow.weight = filteredRowAbove.data.weight - 0.5;
      operations.push(() => {
        this.tbody.insertBefore(draggedRow.element, filteredRowAbove.element);
      });
    }

    if (filteredRowBelow && draggedRow !== filteredRowBelow) {
      currentTableDataRow.weight = filteredRowBelow.data.weight + 0.5;
      operations.push(() => {
        this.tbody.insertBefore(draggedRow.element, filteredRowBelow.element.nextElementSibling);
      });
    }

    if (operations.length) {
      this.updateWeightsToIntegers(tableData);
    }

    if (this.isValidTransition(cleanTableData, tableData)) {
      operations.push(() => {
        this.rows.forEach((row) => row.postTransition());
      });

      operations.forEach((operation) => operation());
    }
  }

  getChildrenOfRow (parentRow) {
    let children = [];

    let passedParentRow = false;
    let passedAllChildren = false;

    this.rows.forEach((row) => {
      if (passedParentRow && row.data.depth <= parentRow.data.depth) {
        passedAllChildren = true;
      }

      if (passedParentRow && !passedAllChildren) {
        children.push(row);
      }

      if (row.data.id === parentRow.data.id) {
        passedParentRow = true;
      }
    });

    return children;
  }

  updateWeightsToIntegers (tableData) {
    tableData = tableData.sort((row) => row.weight).reverse();

    tableData.forEach((row, delta) => {
      row.weight = (delta + 1);
    });

    return tableData;
  }

  toData () {
    return this.rows.map((row) => row.data);
  }

  isValidTransition (oldTableData, proposedTableData) {
    let validateEvent = new CustomEvent('isValidTransition', { cancelable: true, detail: {
        oldStructure: oldTableData,
        newStructure: proposedTableData
      }
    });

    this.table.dispatchEvent(validateEvent);
    return !validateEvent.defaultPrevented;
  }

  getRowById (id) {
    return this.rows.find((row) => row.data.id === id);
  }

  getRowByElement (element) {
    return this.rows.find((row) => row.element === element);
  }
}