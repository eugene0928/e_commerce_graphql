import JWT from '../../utils/jwt.js'

export default {
    Query: {
        categories: (_, { id }, { read }) => {
            return read('category').filter( type => id ? type.categoryId == id : true )
        }
    },

    Mutation: {
        addCategory: (parent, { token, categoryName }, { read, write }) => {
            try {
                // check token 
                const { userId, password } = JWT.verify(token)
                const admins = read('admin')
                const validAdmin = admins.find(admin => admin.id == userId && admin.password == password)
                if(!validAdmin) {
                    return {
                        status: 404,
                        message: "Such admin is not found!",
                        data: null
                    }
                }

                if(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(categoryName) || /\d+/.test(categoryName)) {
                    return {
                        status: 400,
                        message: "Category name should be string!",
                        data: null
                    }
                }

                let categories = read('category')
                const validCategory = categories.find(category => category.categoryName == categoryName)

                if(validCategory) {
                    return { 
                        status: 400,
                        message: "This category already exists!",
                        data: null
                    }
                }

                const newCategory = {
                    categoryId: categories.length ? +categories.at(-1).categoryId + 1 : 1,
                    categoryName: categoryName.toLowerCase()
                }
                categories.push(newCategory)
                write('category', categories)
                return {
                    status: 200,
                    message: "Category is added successfully!",
                    data: newCategory
                }
            } catch (error) {
                return {
                    status: 500,
                    message: error.message,
                    data: null
                }
            }
        }
    }
}