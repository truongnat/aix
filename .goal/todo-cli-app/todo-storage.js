// todo-storage.js
//
const fs = require('fs');

module.exports = {
  add: (item) => {
    const data = JSON.parse(fs.readFileSync('./todo-items.json', 'utf8')) || [];
    item.dueDate = new Date(item.dueDate).toISOString();
    data.push(item);
    fs.writeFileSync('./todo-items.json', JSON.stringify(data));
  },
  list: () => {
    const data = JSON.parse(fs.readFileSync('./todo-items.json', 'utf8')) || [];
    return data.map((item) => ({...item, dueDate: new Date(item.dueDate)}));
  },
  delete: (id) => {
    const data = JSON.parse(fs.readFileSync('./todo-items.json', 'utf8')) || [];
    const filteredData = data.filter((item) => item.id !== id);
    fs.writeFileSync('./todo-items.json', JSON.stringify(filteredData));
  }
};