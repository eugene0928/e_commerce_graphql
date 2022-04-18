import JWT from '../../utils/jwt.js'
import sha256 from 'sha256'

export default {
    Query: {
        statics: (_, { token }, { read }) => {
            //check token
            try {
                const { userId, password } = JWT.verify(token)
                const admins = read('admin')
                const validAdmin = admins.find(admin => admin.id == userId && admin.password == password)
                if(!validAdmin) {
                    return {
                        status: 404,
                        id: null,
                        monthlyPaidMoney: null,
                        monthlyUnpaidMoney: null,
                        mostSoldProduct: null,
                        leadtSoldProduct: null,
                        message: "This admin is not found!"
                    }
                }

                let paidMoney = 0
                let unpaidMoney = 0
                const orders = read('order')
                 
            } catch (error) {
                return {
                    status: 500,
                    id: null,
                    monthlyPaidMoney: null,
                    monthlyUnpaidMoney: null,
                    mostSoldProduct: null,
                    leadtSoldProduct: null,
                    message: error.message
                }
            }
            
        }
    },

}