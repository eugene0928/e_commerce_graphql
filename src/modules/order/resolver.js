import JWT from '../../utils/jwt.js'
import sha256 from 'sha256'

export default {
    Query: {
        orders: (_, { token, id }, { read }) => {
           try {
               //check token
                const { userId, password } = JWT.verify(token) 
                const admins = read('admin')
                const validAdmin = admins.find(admin => admin.id == userId && admin.password == password)
                if(!validAdmin) {
                    return {
                        orderId: null,
                        userId: null,
                        products: null, 
                        totalPrice: null,
                        isPaid: null,
                        message: "Such admin does not exist!"
                    }
                }

                return read('order').filter( order => id ? order.orderId == id : true )
           } catch (error) {
               return {
                    orderId: null,
                    userId: null,
                    products: null,
                    totalPrice: null,
                    isPaid: null,
                    message: error.message
               }
           }
           
        }
    },

    Mutation: {
        addOrder: (parent, { token, product }, { read, write }) => {
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

                const allProducts = read('product')
                console.log(allProducts, product)
                const Product = allProducts.find(products => products.name == product)
                if( !Product ) {
                    return {
                       status: 404,
                       message: "Product is not found!"
                    }
                } 
                
                let orders = read('order')
                const userOrder = orders.find(order => order.userId == userId)
                //if user exists in order list
                if(userOrder) {
                    if(userOrder.isPaid) {
                        const newOrder = {
                            orderId: orders.length ? +orders.at(-1).orderId + 1 : 1,
                            userId: userOrder.userId,
                            products: [],
                            totalPrice: 0,
                            isPaid: false
                        }
                        newOrder.products.push(product)
                        newOrder.totalPrice += Product.price
                        orders.push(newOrder)
                    } else {
                        userOrder.products.push(product)
                        userOrder.totalPrice += Product.price
                    }
                    write('order', orders)
                    return {
                        status: 200,
                        message: "Orders are added successfully"
                    }
                }

                //if user does not exist in order list
                const newOrder = {
                    orderId: orders.length ? +orders.at(-1).orderId + 1 : 1,
                    userId: userId,
                    products: [],
                    totalPrice: 0,
                    isPaid: false
                }
                newOrder.products.push(product)
                newOrder.totalPrice += Product.price
                orders.push(newOrder)
                write('order', orders)
                return {
                    status: 200,
                    message: "Orders are added successfully!"
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