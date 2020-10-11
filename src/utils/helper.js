class helper {
   /**
     * 响应统一格式化输出对象
     * @param {*} ctx 
     * @param {*} status 
     * @param {*} msg 
     * @param {*} data 
     */
   static responseFormat(ctx, code, msg, data = [], others) {
      ctx.response.status = 200
      if (Object.prototype.toString.call(others) === '[object Object]') {
         ctx.body = Object.assign({
            code: code,
            msg: msg,
            data: data
         }, others)
      } else {
         ctx.body = {
            code: code,
            msg: msg,
            data: data
         }
      }
   }

   /**
     * 异步读取文件
     * @param {*} filepath 
     */
   static asyncReadFile (filepath) {
      var fs = require('fs')
      var path = require('path')
      let buf = Buffer.allocUnsafe(0)
      return new Promise((resolve, reject) => {
         var readerStream = fs.createReadStream(filepath, { highWaterMark :1 })
         readerStream.on('data', function(chunk) {
            buf = Buffer.concat([buf, chunk], buf.length + chunk.length)
         })
         readerStream.on('end',function(){
            resolve(buf.toString())
         })
      })
   }   
}

export default helper