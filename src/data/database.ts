import moongose from 'mongoose'
import 'dotenv/config'

const { MONGODB_URI } = process.env

const database = moongose.createConnection(MONGODB_URI || '')

export default database
