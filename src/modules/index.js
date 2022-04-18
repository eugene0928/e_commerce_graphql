import { makeExecutableSchema } from '@graphql-tools/schema'

import categoryModel from './category/index.js'
import adminModel from './admin/index.js'
import registerModel from './user/index.js'
// import productModel from './product/index.js'
import orderModel from './order/index.js'
import paymentModel from './payment/index.js'

export const schema = makeExecutableSchema({
    typeDefs: [
        categoryModel.typeDef, adminModel.typedef, registerModel.typeDef, orderModel.typeDef, paymentModel.typeDef
    ],
    resolvers: [
        categoryModel.resolver, adminModel.resolver, registerModel.resolver, orderModel.resolver, paymentModel.resolver
    ]
})