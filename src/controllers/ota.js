import Device from '../models/device'
import helper from'../utils/helper'
import OTAService from '../services/otaService'

class otaController {
   static async sendOTA(ctx) {
      const productName = ctx.params.productName,
         deviceName = ctx.params.deviceName;
      
      const device = await Device.findOne({ product_name: productName, device_name: deviceName })

      if(err) helper.responseFormat(ctx, 500, 'server error', err)
      else if(device) {
         OTAService.sendOTA({
            productName: device.product_name,
            deviceName: device.device_name,
            fileUrl: ctx.request.body.url,
            size: parseInt(ctx.request.body.size),
            md5: ctx.request.body.md5,
            version: ctx.request.body.version,
            type: ctx.request.body.type
         })
         helper.responseFormat(ctx, 200, 'success')
      } else helper.responseFormat(ctx, 404, 'device not found')
   }
   static async get(ctx) {
      const productName = ctx.params.productName,
         deviceName = ctx.params.deviceName;

      OTAService.getProgress(productName, deviceName, (error, progress) => {
         if (error) helper.responseFormat(ctx, 500, 'device not found', error)
         else helper.responseFormat(ctx, 200, 'success', progress)
      })
   }
}

export default otaController