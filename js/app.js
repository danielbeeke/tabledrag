import TableDrag from './TableDrag.js';

let table = document.querySelector('.es6-table-drag');

new TableDrag(table, {
  validators: [
    // Shortest but not settings injected into the validator
    [TableDrag.validators.maxDepth, {
      max: 5
    }],

    // With settings injected into the validator
    [TableDrag.validators.tree, {
      myOption: true
    }]
  ]
});

// Event listener for validation, the validators use the same event. The validator structure is only for reuse.
table.addEventListener('isValidTransition', function (event) {
  // The structure to validate is: event.detail.rows
  // When the structure is invalid call: event.preventDefault();
});