import Joi from 'joi' 

const schema = Joi.object( {
    username: Joi.string()
        .min(3)
        .max(30)
        .required(),
    password: Joi.string()
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[a-zA-Z]).{4,}$/))
        .required(),
    contact: Joi.string()
        .pattern(new RegExp(/^998[389][012345789][0-9]{7}$/))
        .required(),
    email: Joi.string()
        .pattern(new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/))
        .required()

} ) 
    .with('username', 'password')

process.Joi = {
    schema
}