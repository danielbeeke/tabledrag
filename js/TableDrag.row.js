export default class Row {
  constructor (rowElement, tableDrag) {
    if (!rowElement.tagName || rowElement.tagName !== 'TR') {
      throw 'The first parameter must be the tr HTML element.';
    }

    this.element = rowElement;
    this.tableDrag = tableDrag;

    this.element.draggable = true;

    this.element.addEventListener('dragstart', (event) => this.dragStart(event));
    this.element.addEventListener('drag', (event) => this.drag(event));
    this.element.addEventListener('dragend', (event) => this.dragEnd(event));
  }

  dragStart (event) {
    event.dataTransfer.setData('text/plain', null);
  }

  drag (event) {
    console.log(event)
  }

  dragEnd (event) {
    console.log(event)
  }
}