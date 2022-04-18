import JWT from '../../utils/jwt.js'
import { join } from 'path'
export const post = (req, res, next) => {
    try {
        const { helper } = req
        const { token } = req.headers
        const { userId, password } = JWT.verify(token)

        const admins = helper.read('admin')
        const validAdmin = admins.find(admin => admin.id == userId && admin.password == password)
        if(!validAdmin) {
            return res.status(404)
                       .json({ status: 404, message: "Such admin is not found!" })
        }
        const { categoryId, name, price, shortDesc, longDesc } = req.body
        const file = req.files.file
        console.log(file.mimetype)
        // read data
        const categories = helper.read('category')
        const products = helper.read('product')

        if(!(categories.find(category => category.categoryId == categoryId))) {
            return res.status(404)
                .json({ status: 404, message: "Such category is not available!" })
        }

        if(products.find(p => p.name == name)) {
            return res.status(400)
                        .json({ status: 400, message: "Such product already exists!" })
        }

        if(!(/^\w\D+$/.test(name))) {
            return res.status(400)
                        .json({ status: 400, message: "Invalid product name!" })
        }

        if(!(/^\d+$/).test(price)) {
            return res.status(400)
                        .json({ status: 400, message: "Invalid product price!" })
        }

        if(!(['image/jpeg', 'image/jpg', 'image/svg', 'image/png'].includes(file.mimetype))) {
            return res.status(400)
                        .json({ status:400, message: "File must be image!" })
        }

        if(file.size > 5 * 1024 * 1024) {
            return res.status(400)
                        .json({ status: 400, message: "File mnust be smaller than 5MB!" })
        }
        file.name = `${Date.now()}${file.name}`
        const newProduct = {
            id: products.length ? +products.at(-1).id + 1 : 1,
            categoryId,
            name, 
            price: +price,
            shortDesc,
            longDesc,
            img: "./images/" + file.name
        }
        
        products.push(newProduct)
        helper.write('product', products)
        file.mv(join(process.cwd(), 'src', 'public', 'images', file.name))

        return res.status(200)
                    .json({ status: 200, message: "Product is added successfully!" })
   } catch (error) {
       res.status(500)
            .json({ status: 500, message: error.message })
   }
}