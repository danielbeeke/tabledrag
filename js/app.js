import TableDrag from './TableDrag.js';

let tables = document.querySelectorAll('.es6-table-drag');

Array.from(tables).forEach((table) => {
  new TableDrag(table);

  table.addEventListener('isValidTransition', function (event) {
    event.detail.rows.forEach((row) => {
      if (parseInt(row.depth) > 4) {
        event.preventDefault();
      }
    })
  })
});