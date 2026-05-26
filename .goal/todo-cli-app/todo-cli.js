// todo-cli.js
//
const todoStorage = require('./todo-storage');
const todoParser = require('./todo-parser');

module.exports = {
  add: (item) => todoStorage.add(todoParser.parse(item)),
  list: () => todoStorage.list()
};