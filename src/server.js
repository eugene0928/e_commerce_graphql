import conf from './config.js'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import express from 'express'
import http from 'http'
import fileUpload from 'express-fileupload'
import helper from './utils/helper.js'
import { schema } from './modules/index.js'
import "./utils/validation.js"
import { post } from './modules/product/post.js'
import { delProduct } from './modules/product/delProduct.js'

async function startApolloserver() {
    const app = express()
    const httpServer = http.createServer(app)
    const server = new ApolloServer( {
        context: (req, res) => helper,
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer })
        ]
    } )
    app.use(fileUpload())
    app.use((req, res, next) => {
        req.helper = helper
        next()
    })
    app.post('/product', post)
    app.post('/deleteproduct', delProduct)

    await server.start()
    server.applyMiddleware({ 
        app,
        path: '/graphql'
    })
    await new Promise( resolve => httpServer.listen({ port: process.env.PORT || 5000 }, resolve) )
    console.log(`==> http://localhost:5000` + server.graphqlPath)
}

startApolloserver()