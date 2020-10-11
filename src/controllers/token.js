import shortid from 'shortid'
import jwt from 'jsonwebtoken'
import helper from'../utils/helper'
import config from 'dotenv'
// import { jsonWebTokenSecret } from '../../config/project.config'
config.config()

class tokenController {
    static async generate(ctx) {
        let name = shortid.generate()
        let token = jwt.sign({
            username: name,
            exp: Math.floor(Date.now() / 1000) + 600
        }, process.env.JWT_SECRET);
        helper.responseFormat(ctx, 200, 'success', { name, token })
    }
}

export default tokenController