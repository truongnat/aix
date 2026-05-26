const todoStorage = require('./todo-storage');
const todoParser = require('./todo-parser');

module.exports.add = (item) => {
  todoStorage.add(todoParser.parse(item));
};

module.exports.list = () => {
  return todoStorage.list();
};