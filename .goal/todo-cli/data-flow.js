// Define data flow for Todo CLI app
//
// User input -> todo-parser -> todo-storage -> todo-list

const todoParser = require('./todo-parser');
const todoStorage = require('./todo-storage');
const todoList = require('./todo-list');

module.exports = function(data) {
  // Parse user input using todo-parser
  const parsedData = todoParser.parse(data);

  // Store todo item in todo-storage
  todoStorage.create(parsedData)
    .then(() => {
      // Retrieve updated todo list from todo-storage
      return todoStorage.list();
    })
    .then((todoList) => {
      // Display updated todo list to user
      todoList.display(todoList);
    });
};