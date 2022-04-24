import JWT from '../../utils/jwt.js'
import sha256 from 'sha256'

export default {
    Query: {
        orders: (_, { token, id }, { helper: {read}, userAgent }) => {
           try {
               //check token
                const { userId, password, agent } = JWT.verify(token) 
                const admins = read('admin')
                const validAdmin = admins.find(admin => admin.id == userId && admin.password == password)
                if(!validAdmin || agent != userAgent) {
                    return [{
                        orderId: null,
                        userId: null,
                        products: null, 
                        totalPrice: null,
                        isPaid: null,
                        message: "Such admin does not exist or request is sent from wrong device!"
                    }]
                }

                return read('order').filter( order => id ? order.orderId == id : true )
           } catch (error) {
               return [{
                    orderId: null,
                    userId: null,
                    products: null,
                    totalPrice: null,
                    isPaid: null,
                    message: error.message
               }]
           }
           
        }
    },

    Order: {
        user: ({ userId }, __, { helper: { read } }) => {
            const users = read('user')
            return users.find(user => user.userId == userId)
        },
        products: () => {
            return ['a']
        }
    }, 

    Mutation: {
        addOrder: (parent, { token, product, username }, { helper: {read, write}, userAgent }) => {
            try {
                if(!token) {
                    return {
                        status: 401,
                        message: "Token is required!"
                    }
                }
                //unfold token
                const { userId, password, agent } = JWT.verify(token)
                const users = read('user')
                const validUser = users.find(user => user.userId == userId && user.password == password && user.username == username)
                if(!validUser || agent != userAgent) {
                    return {
                        status: 404,
                        message: "The user is not found or request is sent from wrong device!"
                    }
                }

                const allProducts = read('product')
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