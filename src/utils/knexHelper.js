import knex from 'knex'
import config from '../../config/db.config'

const knexInstance = knex({
    client: 'mysql',
    connection: {
        host : config[process.env.NODE_ENV].host,
        port: config[process.env.NODE_ENV].port,
        user : config[process.env.NODE_ENV].user,
        password : config[process.env.NODE_ENV].password,
        database : config[process.env.NODE_ENV].database
    },
    // pool: {
    //     min: 0,
    //     max: 10,
    //     idle: 10000
    // },
    acquireConnectionTimeout: 180000
});

export default knexInstance;