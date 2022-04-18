import { join } from 'path'
import dotenv from 'dotenv'

dotenv.config({path: join(process.cwd(), 'src', '.env')})

export default {
    dotenv
}