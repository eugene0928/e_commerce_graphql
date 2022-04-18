import JWT from '../../utils/jwt.js'
import { join } from 'path'
import { unlinkSync } from 'fs'

export const delProduct = (req, res, next) => {
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

        const { categoryId, name } = req.body

        // read data
        const categories = helper.read('category')
        let products = helper.read('product')

        if(!(categories.find(category => category.categoryId == categoryId))) {
            return res.status(404)
                .json({ status: 404, message: "Such category is not available!" })
        }

        const delProduct = products.find(p => p.name == name)
        if(!delProduct) {
            return res.status(400)
                        .json({ status: 400, message: "Such product is not found!" })
        }

        products = products.filter(product => product.name != name)
        helper.write('product', products)
        unlinkSync(join(process.cwd(), 'src', 'public', delProduct.img))

        return res.status(200)
                    .json({ status: 200, message: "Product is deleted successfully!" })
   } catch (error) {
       console.log(error)
       res.status(500)
            .json({ status: 500, message: error.message })
   }
}