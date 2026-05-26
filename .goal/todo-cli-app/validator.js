const Joi = require('joi');

module.exports = {
  validateTodoItem: (item) => {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string(),
      dueDate: Joi.date()
    });

    return Joi.validate(item, schema);
  }
};