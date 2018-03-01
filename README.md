# Tabledrag

This plugin is currently being created.
The purpose of this plugin is to allow programmers to add tabledrag functionality to a table.
It is build because the Drupal tabledrag.js was to messy and complex to add validations to.

## The validation trick

When dragging, the reactions are saved in functions as an operation.
This operation is simulated on a copy of the table.
That table is passed on to the event listeners.
if validated by the implementation of the plugin the operations are run again but this time on the real table.

## How to use

```

import TableDrag from './TableDrag.js';

let table = document.querySelector('#my-table');

new TableDrag(table);

table.addEventListener('isValidTransition', function (event) {
  
  // The structure to validate is: event.detail.rows
  
  // When the structure is invalid call: event.preventDefault();

});

```

## ES6

For now this plugin is written in ES6 and there is no dist in es5.
When the structure is ready for use I will add a es5 build.

## Local developing

Not that difficult, just host this folder with a server.
I use 'harp server' because it's easy.

```
npm install -g harp-server;
harp server;
```

You need a modern browser. Firefox or Chrome.
If using Firefox you should enable dom.moduleScripts.enabled in about:config.

## Video with some explanation

[![Video](https://img.youtube.com/vi/jCYV17J8ZoQ/0.jpg)](https://www.youtube.com/watch?v=jCYV17J8ZoQ) 