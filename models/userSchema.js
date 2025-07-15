const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 digits',
      'any.required': 'Phone number is required'
    }),

  usertype: Joi.string()
    .valid('vendor', 'admin', 'user')
    .required()
    .messages({
      'any.only': 'User type must be either vendor, admin, or user',
      'any.required': 'User type is required'
    }),

  profile_image: Joi.string().allow('').optional(),
  
  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

module.exports = userSchema; 