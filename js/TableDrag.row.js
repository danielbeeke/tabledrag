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
    this.data = {};
    this.parseData();
    this.data.id = this.guid();
    this.element.draggable = true;
    this.dragCssClass = this.tableDrag.options.dragCssClass;
    this.calculateRect();
    this.startX = null;

    this.element.addEventListener('dragstart', (event) => this.dragStart(event), false);
    this.element.addEventListener('dragend', (event) => this.dragEnd(event), false);
    this.element.addEventListener('drop', (event) => this.drop(event), false);
    this.element.addEventListener('mousedown', (event) => this.mouseDown(event), false);
    this.element.addEventListener('mouseup', (event) => this.mouseUp(event), false);
  }

  /**
   * Parses the HTML data attributes to the instance.
   */
  parseData () {
    this.data = Object.assign(this.data, {
      title: this.element.innerText,
      weight: parseInt(this.element.dataset.weight),
      depth: parseInt(this.element.dataset.depth)
    });
  }

  /**
   * Writes the instance data to the HTML data attributes.
   */
  writeData () {
    this.element.dataset.weight = this.data.weight;
    this.element.dataset.depth = this.data.depth;
  }

  /**
   * After doing changes to the DOM we need to recalculate things for this row.
   */
  postTransition () {
    this.calculateRect();
    this.writeData();
  }

  /**
   * Returns a unique ID.
   */
  guid () {
    let s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
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
  }

  /**
   * When mouse up we need to release the highlight.
   * @param event
   */
  mouseUp (event) {
    this.element.classList.remove(this.dragCssClass);
  }

  /**
   * When we start the dragging we need to set the icon so the cursor is normal.
   * @param event
   */
  dragStart (event) {
    event.dataTransfer.setData('tableRow', this.data.id);
    this.element.classList.add(this.dragCssClass);
    event.dataTransfer.effectAllowed = 'none';

    let dragIcon = document.createElement('img');
    dragIcon.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    event.dataTransfer.setDragImage(dragIcon, 0, 0);

    this.startX = event.pageX;
    this.tableDrag.setStartDepths();
  }

  /**
   * When dragging is done, release highlight and clear data.
   * @param event
   */
  dragEnd (event) {
    this.element.classList.remove(this.dragCssClass);
    this.startX = null;
    this.tableDrag.unsetStartDepths();
  }

  /**
   * This is needed for HTML5 drag and drop API.
   * @param event
   */
  drop (event) {
    event.preventDefault();
  }
}