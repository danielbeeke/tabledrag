export default class Row {
  constructor (rowElement, tableDrag) {
    if (!rowElement.tagName || rowElement.tagName !== 'TR') {
      throw 'The first parameter must be the tr HTML element.';
    }

    this.element = rowElement;
    this.tableDrag = tableDrag;
    this.data = this.tableDrag.connector.parseRow(this.element);
    this.id = parseInt(this.data.weight);
    this.element.draggable = true;
    this.calculateRect();

    this.element.addEventListener('dragstart', (event) => this.dragStart(event), false);
    this.element.addEventListener('drag', (event) => this.drag(event), false);
    this.element.addEventListener('dragend', (event) => this.dragEnd(event), false);
    this.element.addEventListener('drop', (event) => this.drop(event), false);
  }

  calculateRect () {
    this.rect = this.element.getBoundingClientRect();
  }

  dragStart (event) {
    event.dataTransfer.setData('tableRow', this.id);
    this.element.classList.add('is-dragged');
    event.dataTransfer.effectAllowed = 'none';

    let dragIcon = document.createElement('img');
    dragIcon.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    event.dataTransfer.setDragImage(dragIcon, 0, 0);
  }

  drag (event) {



  }

  dragEnd (event) {
    this.element.classList.remove('is-dragged');
  }

  drop (event) {
    event.preventDefault();
  }
}