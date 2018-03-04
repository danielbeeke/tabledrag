import Row from './TableDrag.row.js';

// Included validators.
import Tree from './TableDrag.validator.tree.js';
import MaxDepth from './TableDrag.validator.maxDepth.js';
import Types from './TableDrag.validator.types.js';

/**
 * Defaults for the tableDrag.
 */
let defaultOptions = {
  dragCssClass: 'is-dragged',
  dragCssChildClass: 'parent-is-dragged',
  nestingDragDistance: 30,
  validators: [Tree]
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

    // Initiate the weight data attributes if not available.
    if (!this.rows[0].element.dataset.weight) {
      this.rows.forEach((row, delta) => {
        row.element.dataset.weight = delta + 1;
      });
    }

    // Initiate the depth data attributes if not available.
    if (!this.rows[0].element.dataset.depth) {
      this.rows.forEach(row => row.element.dataset.depth = 0);
    }


    // Start all the validator plugins.
    this.options.validators.forEach((validatorItem) => {
      // Complex notation.
      if (typeof validatorItem === 'object') {
        new validatorItem[0](this, validatorItem[1]);
      }
      // Short notation.
      else if (typeof validatorItem === 'function') {
        new validatorItem(this);
      }
    })
  }

  /**
   * When dragging, the reactions are saved in functions as an operation.
   * This operation is simulated on a copy of the table.
   * That table is passed on to the event listeners.
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
    let children = JSON.parse(event.dataTransfer.getData('tableRowStartChildren'));

    /**
     * START Vertical movement.
     */
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
    /**
     * END Vertical movement.
     */

    /**
     * START Horizontal movement.
     */
    let times = Math.floor((event.pageX - startX) / this.options.nestingDragDistance);

    if (startDepth + times >= 0) {
      operations.push((tbody) => {
        let draggedRowElement = this.getElementInTbodyById(tbody, draggedRowId);
        draggedRowElement.dataset.depth = startDepth + times;
        children.forEach((childData) => {
          let childElement = this.getElementInTbodyById(tbody, childData.id);
          childElement.dataset.depth = childData.depth + times;
        });
      });
    }

    operations.push((tbody) => {
      this.rows.forEach((row) => row.postTransition());
      Array.from(tbody.children).forEach((row, delta) => row.dataset.weight = delta + 1);
    });
    /**
     * END Horizontal movement.
     */

    // Execute the operations on the cloned table.
    operations.forEach((operation) => operation(clonedTbody));

    // If validated execute the operations on the real table.
    if (this.isValidTransition(clonedTbody, draggedRow)) {
      operations.forEach((operation) => operation(this.tbody));

      let changeEvent = new CustomEvent('change');
      this.table.dispatchEvent(changeEvent);
    }
  }

  /**
   * Dispatches the isValidTransition event.
   * @param simulatedTbody
   * @param draggedRow
   * @returns {boolean}
   */
  isValidTransition (simulatedTbody, draggedRow) {
    let validateEvent = new CustomEvent('isValidTransition', {
      cancelable: true,
      detail: {
        rows: Array.from(simulatedTbody.children),
        draggedRow: draggedRow,
        tableDrag: this,
        simulatedTbody: simulatedTbody
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

  /**
   * Get all children from a row.
   * @param tbody
   * @param id
   * @returns {Array}
   */
  getChildren (tbody, id) {
    let parentRow = this.getElementInTbodyById(tbody, id);

    let children = [];

    let passedParentRow = false;
    let passedAllChildren = false;

    Array.from(tbody.children).forEach((row) => {
      if (passedParentRow && parseInt(row.dataset.depth) <= parseInt(parentRow.dataset.depth)) {
        passedAllChildren = true;
      }

      if (passedParentRow && !passedAllChildren) {
        children.push(row);
      }

      if (row.dataset.id === parentRow.dataset.id) {
        passedParentRow = true;
      }
    });

    return children;
  }

  /**
   * Get all parents from a row.
   * @param tbody
   * @param id
   * @returns {Array}
   */
  getParents (tbody, id) {
    let parents = [];
    let passedSelf = false;
    let childElement = this.getElementInTbodyById(tbody, id);
    let previousDepth = parseInt(childElement.dataset.depth);

    Array.from(tbody.children).reverse().forEach((row) => {
      if (row === childElement) passedSelf = true;
      if (passedSelf && parseInt(row.dataset.depth) === previousDepth - 1) {
        parents.push(row);
        previousDepth = parseInt(row.dataset.depth);
      }
    });

    return parents;
  }

  /**
   * Returns the element in a table by id.
   * @param tbody
   * @param id
   * @returns {any}
   */
  getElementInTbodyById (tbody, id) {
    return Array.from(tbody.children).find(row => row.dataset.id === id);
  }

}

/**
 * The list of included validators for the implementor to use.
 */
TableDrag.validators = {
  tree: Tree,
  maxDepth: MaxDepth,
  types: Types
};

window.TableDrag = TableDrag;