import JWT from '../../utils/jwt.js'
import sha256 from 'sha256'

export default {
    Query: {
        payment: () => true
    },

    Mutation: {
        payOrder: (parent, { token }, { read, write }) => {
            try {
                if(!token) {
                    return {
                        status: 401,
                        message: "Token is required!"
                    }
                }
                //unfold token
                const { userId, password } = JWT.verify(token)
                const users = read('user')
                const validUser = users.find(user => user.userId == userId && user.password == password)
                if(!validUser) {
                    return {
                        status: 404,
                        message: "The user is not found!"
                    }
                }

                let orders = read('order')
                const userOrder = orders.find(order => order.userId == userId)
                if(!userOrder) {
                    return {
                        status: 404,
                        message: "The user is not found in orderlist!"
                    }
                }

                if(userOrder.isPaid) {
                    return {
                        status: 400,
                        message: "This user has already paid!"
                    }
                }

                userOrder.isPaid = true
                write('order', orders)
                return {
                    status: 200,
                    message: "Payment is accepted successfully!"
                }
            } catch (error) {
                return {
                    status: 500,
                    message: error.message
                }
            }

        }
    }
}