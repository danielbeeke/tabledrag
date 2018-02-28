export default class Row {

  /**
   * Instantiates a table row instance.
   * @param rowElement, tr element.
   * @param tableDrag, the parent tableDrag class.
   */
  constructor (rowElement, tableDrag) {
    if (!rowElement.tagName || rowElement.tagName !== 'TR') throw 'The first parameter must be the tr HTML element.';

    this.tableDrag = tableDrag;
    this.element = rowElement;
    if (!this.element.dataset.id) this.element.dataset.id = this.guid();
    this.element.draggable = true;
    this.dragCssClass = this.tableDrag.options.dragCssClass;
    this.dragCssChildClass = this.tableDrag.options.dragCssChildClass;
    this.calculateRect();

    this.element.addEventListener('dragstart', (event) => this.dragStart(event), false);
    this.element.addEventListener('dragend', (event) => this.dragEnd(event), false);
    this.element.addEventListener('drop', (event) => this.drop(event), false);
    this.element.addEventListener('mousedown', (event) => this.mouseDown(event), false);
    this.element.addEventListener('mouseup', (event) => this.mouseUp(event), false);
  }

  /**
   * After doing changes to the DOM we need to recalculate things for this row.
   */
  postTransition (delta) {
    this.calculateRect();
  }

  /**
   * Calculates position for the logic of moving rows.
   */
  calculateRect () {
    this.rect = this.element.getBoundingClientRect();
  }

  /**
   * When a user clicks and holds the mouse we want to highlight the row.
   * @param event
   */
  mouseDown (event) {
    this.element.classList.add(this.dragCssClass);
    this.getChildren().forEach((child) => child.classList.add(this.dragCssChildClass));
  }

  /**
   * When mouse up we need to release the highlight.
   * @param event
   */
  mouseUp (event) {
    this.element.classList.remove(this.dragCssClass);
    this.getChildren().forEach((child) => child.classList.remove(this.dragCssChildClass));
  }

  /**
   * When we start the dragging we need to set the icon so the cursor is normal.
   * @param event
   */
  dragStart (event) {
    this.tableDrag.updateTableDataStart();
    event.dataTransfer.effectAllowed = 'none';
    let dragIcon = document.createElement('img');
    dragIcon.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    event.dataTransfer.setDragImage(dragIcon, 0, 0);
    event.dataTransfer.setData('tableRowId', this.element.dataset.id);
    event.dataTransfer.setData('tableRowStartX', event.pageX);
    event.dataTransfer.setData('tableRowStartDepth', this.element.dataset.depth);
    let children = this.getChildren().map(child => {
      let data = Object.assign({}, child.dataset);
      data.depth = parseInt(data.depth);
      data.weight = parseInt(data.weight);
      return data;
    });
    event.dataTransfer.setData('tableRowChildren', JSON.stringify(children));

    this.element.classList.add(this.dragCssClass);
    this.getChildren().forEach((child) => child.classList.add(this.dragCssChildClass));
  }

  /**
   * Get all children from a row.
   * @returns {Array}
   */
  getChildren () {
    let parentRow = this.element;

    let children = [];

    let passedParentRow = false;
    let passedAllChildren = false;

    Array.from(this.tableDrag.tbody.children).forEach((row) => {
      if (passedParentRow && row.dataset.depth <= parentRow.dataset.depth) {
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
   * When dragging is done, release highlight and clear data.
   * @param event
   */
  dragEnd (event) {
    this.element.classList.remove(this.dragCssClass);
    this.getChildren().forEach((child) => child.classList.remove(this.dragCssChildClass));
  }

  /**
   * This is needed for HTML5 drag and drop API.
   * @param event
   */
  drop (event) {
    event.preventDefault();
  }

  /**
   * Returns a unique ID.
   */
  guid () {
    let s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
}