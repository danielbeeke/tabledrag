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
    if (!this.id) this.id = this.guid();
    this.element.draggable = true;
    this.dragCssClass = this.tableDrag.options.dragCssClass;
    this.dragCssChildClass = this.tableDrag.options.dragCssChildClass;
    this.calculateRect();
    this.children = [];

    this.element.addEventListener('dragstart', (event) => this.dragStart(event), false);
    this.element.addEventListener('dragend', (event) => this.dragEnd(event), false);
    this.element.addEventListener('drop', (event) => this.drop(event), false);
    this.element.addEventListener('mousedown', (event) => this.mouseDown(event), false);
    this.element.addEventListener('mouseup', (event) => this.mouseUp(event), false);
  }

  set id (id) {
    this.element.dataset.id = id;
  }

  get id () {
    return this.element.dataset.id;
  }

  /**
   * After doing changes to the DOM we need to recalculate things for this row.
   */
  postTransition () {
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
    this.children = this.tableDrag.getChildren(this.tableDrag.tbody, this.id);
    this.children.forEach((child) => child.classList.add(this.dragCssChildClass));
  }

  /**
   * When mouse up we need to release the highlight.
   * @param event
   */
  mouseUp (event) {
    this.element.classList.remove(this.dragCssClass);
    this.children.forEach((child) => child.classList.remove(this.dragCssChildClass));
  }

  /**
   * When we start the dragging we need to set the icon so the cursor is normal.
   * @param event
   */
  dragStart (event) {
    this.children = this.tableDrag.getChildren(this.tableDrag.tbody, this.id);
    event.dataTransfer.effectAllowed = 'none';

    let div = document.createElement('div');
    window.tableDragDiv = div;
    div.style = `
      width: 10px; 
      height: 10px; 
      position fixed;
      top: -100000px;
      left: -100000px;
      border: 2px solid rgba(0,0,0,0);
    `;

    document.body.appendChild(div);
    event.dataTransfer.setDragImage(div, 0, 0);

    event.dataTransfer.setData('tableRowId', this.id);
    event.dataTransfer.setData('tableRowStartX', event.pageX);
    event.dataTransfer.setData('tableRowStartDepth', this.element.dataset.depth);

    let frozenChildData = this.children.map(row => {
      let data = Object.assign({}, row.dataset);
      data.depth = parseInt(data.depth);
      data.weight = parseInt(data.weight);
      return data;
    });

    event.dataTransfer.setData('tableRowStartChildren', JSON.stringify(frozenChildData));

    this.element.classList.add(this.dragCssClass);
    this.children.forEach((child) => child.classList.add(this.dragCssChildClass));
  }

  /**
   * When dragging is done, release highlight and clear data.
   * @param event
   */
  dragEnd (event) {
    this.element.classList.remove(this.dragCssClass);
    this.children.forEach((child) => child.classList.remove(this.dragCssChildClass));
    this.children = [];
    window.tableDragDiv.remove();
    delete window.tableDragDiv;
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