import sha256 from 'sha256'
import JWT from '../../utils/jwt.js'

export default {
    Query: {
        admins: (_, { token, id }, { helper: { read }, userAgent }) => {
            try {
                const { userId, password, agent } = JWT.verify(token)

                if(agent != userAgent) {
                    return {
                        id: null,
                        username: null,
                        password: null,
                        contact: null,
                        email: null, 
                        date: null
                    }
                }
               
                return read('admin').filter(admin => id? admin.id == id : true)
            } catch (error) {
                return [{
                    id: null,
                    username: null,
                    password: null,
                    contact: null,
                    email: null, 
                    date: null
                }]
            }
        }
        
    },

    Mutation: { 
        loginAdmin: (_, { username, password }, { helper: { read }, userAgent }) => {
            const admins = read('admin')
            const validAdmin = admins.find(admin => admin.username == username && admin.password == sha256(password))
            if(!validAdmin) {
                return {
                    status: 400,
                    message: "Such admin is not fount!",
                    data: null,
                    token: null
                }
            }

            return {
                status: 200,
                message: "Logged in successfully!",
                data: validAdmin,
                token: JWT.sign({ userId: validAdmin.id, password: validAdmin.password, agent: userAgent })
            }
        },

        addAdmin: (_, { token, username, password, contact, email }, { helper: {read, write}, userAgent }) => {
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
                const validToken = JWT.sign({ userId: newAdmin.id, password: newAdmin.password, agent: userAgent })
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

        deleteAdmin: (_, { token, id }, { helper: {read, write}, userAgent }) => {
           try {
                // check token
                const { userId, password, agent } = JWT.verify(token)

                let admins = read('admin')
                const validAdmin = admins.find( admin => admin.id == userId )
                if(!validAdmin || agent != userAgent) {
                    return {
                        status: 404,
                        message: "This admin is not found or request is sent from wrong device!",
                        data: null,
                        token: null
                    }
                }

                admins = admins.filter(admin => admin.id != userId) 
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