// todo-parser.js
//
module.exports = {
  parse: (input) => {
    const parsedInput = input.trim().split(' ');
    return {
      title: parsedInput[0],
      description: parsedInput.slice(1).join(' '),
      dueDate: new Date(parsedInput[parsedInput.length - 1]).toISOString()
    };
  }
};