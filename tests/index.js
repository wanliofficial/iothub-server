const util = require('util')
const request = require('request')
const { pathToRegexp, match, parse, compile } = require("path-to-regexp")

const config = require("../config/project.config")

// const requestPromise = util.promisify(request)

// const apiUrl = `${config.emqxApi}/connections/mqttjs_4c151c5e`
// requestPromise.delete(apiUrl, {
//     "auth": {
//         "user": config.emqxAppId,
//         "pass": config.emqxAppSecret,
//         "sendImmediately": true
//     }
// }, function (error, response, body) {
//     console.log('error', error);
//     console.log('statusCode:', response && response.statusCode);
//     console.log('body:', body);
// })
console.log(pathToRegexp("/:foo/:bar"))
console.log(pathToRegexp("(cmd_res|rpc_res)/:productName/:deviceName/:commandName/:requestId/:messageId"))