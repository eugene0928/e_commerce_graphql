import sha256 from 'sha256'
import JWT from '../../utils/jwt.js'

export default {
    Query: {
        users: (_, { token, id }, { helper: { read } }) => {
            //check token
            return read('user').filter(user => id ? user.userId == id : true)
        }
    },

    Mutation: {
        register: (_, { username, password, contact, email }, { helper: {read, write}, userAgent }) => {
            const { error } = process.Joi.schema.validate({ username, password, contact, email })
            if(error) {
                return {
                    status: 400,
                    message: error.message,
                    data: null,
                    token: null
                }
            }

            let users = read('user')
            const validUser = users.find(user => user.username == username)
            if(validUser) {
                return {
                    status: 400,
                    message: "This user already exists!",
                    data: null,
                    token: null
                }
            }

            const newUser = {
                userId: users.length ? +users.at(-1).userId + 1 : 1,
                username,
                password: sha256(password),
                contact,
                email,
                data: `${new Date().toISOString().slice(0, 10)}`
            }
            users.push(newUser)
            write('user', users)
            return {
                status: 200,
                message: "New user is registered successfully!",
                token: JWT.sign({ userId: newUser.userId, password: newUser.password, agent: userAgent }),
                data: newUser
            }
        }, 
        login: (_, { username, password }, { helper: {read}, userAgent }) => {
            const users = read('user')
            const validUser = users.find(user => user.username == username && user.password == sha256(password))

            if(!validUser) {
                return {
                    status: 404,
                    message: "The user is not found!",
                    token: null,
                    data: null
                }
            }

            return {
                status: 200,
                message: "The user successfully logged in!",
                token: JWT.sign({ userId: validUser.userId, password: validUser.password, agent: userAgent })
            }
        }
    } 
}