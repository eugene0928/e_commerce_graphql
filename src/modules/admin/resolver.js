import sha256 from 'sha256'
import JWT from '../../utils/jwt.js'

export default {
    Query: {
        admins: (_, { token, id }, { read }) => {
            try {
                const { userId, password } = JWT.verify(token)
               
                return read('admin').filter(admin => id? admin.id == id : true)
            } catch (error) {
                return {
                    id: null,
                    username: null,
                    password: null,
                    contact: null,
                    email: null,
                    date: null
                }
            }
        }
        
    },

    Mutation: { 
        addAdmin: (_, { token, username, password, contact, email }, { read, write, }) => {
           try {
                // check token
                const { userId } = JWT.verify(token)

                const { error } = process.Joi.schema.validate({ username, password, contact, email })
                if(error) {
                    return {
                        status: 400,
                        message: error.message,
                        data: null,
                        token: null
                    }
                }

                const admins = read('admin')
                const validAdmin = admins.find( admin => admin.username == username )
                if(validAdmin) {
                    return {
                        status: 400,
                        message: "This admin already exists!",
                        data: null,
                        token: null
                    }
                }

                const newAdmin = {
                    id: admins.length ? +admins.at(-1).id + 1 : 1,
                    username,
                    password: sha256(password),
                    contact,
                    email,
                    date: `${new Date().toISOString().slice(0, 10)}`
                }
                admins.push(newAdmin)
                write('admin', admins)
                const validToken = JWT.sign({ userId: newAdmin.id, password: newAdmin.password })
                return {
                    status: 200,
                    message: "New admin is added successfully!",
                    data: newAdmin,
                    token: validToken
                }
           } catch (error) {
               return {
                   status: 500,
                   message: error.message,
                   data: null,
                   token: null
               }
           }
        },

        deleteAdmin: (_, { token, id }, { read, write }) => {
           try {
                // check token
                const { userId, password } = JWT.verify(token)

                let admins = read('admin')
                const validAdmin = admins.find( admin => admin.id == id )
                if(!validAdmin) {
                    return {
                        status: 404,
                        message: "This admin is not found!",
                        data: null,
                        token: null
                    }
                }

                admins = admins.filter(admin => admin.id != id) 
                write('admin', admins)
                return {
                    status: 200,
                    message: "Admin is deleted successfully!",
                    data: validAdmin,
                    token: null
                }
           } catch (error) {
                return {
                    status: 500,
                    message: error.message,
                    data: null,
                    token: null
                }
           }

        }
    }
}