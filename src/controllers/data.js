import helper from'../utils/helper'
import InfluxDBService from '../services/influxdbService'

class dataController {
    static async getOperationData(ctx) {
        const productName = ctx.params.productName,
            deviceName = ctx.params.deviceName;

        let limit = ctx.query.limit, page = ctx.query.page, offset = 0, count = 0;

        if (!isNaN(limit) && !isNaN(page)) {
            limit = parseInt(limit);
            page = parseInt(page);
        } else {
            limit = 15;
            page = 1;
        }

        offset = (page - 1) * limit;
        count = await InfluxDBService.getOperationCount({ productName, deviceName })
        const result = await InfluxDBService.readOperationData({ productName, deviceName, limit, offset, desc: true });

        if (result && result.length) helper.responseFormat(ctx, 200, 'success', result, { limit, page, count: count[0].count });
        else helper.responseFormat(ctx, 204, 'success');
    }
    static async getDeviceEDCData(ctx) {
        const productName = ctx.params.productName,
            deviceName = ctx.params.deviceName;

        let limit = ctx.query.limit, page = ctx.query.page, offset = 0, count = 0;

        if (!isNaN(limit) && !isNaN(page)) {
            limit = parseInt(limit);
            page = parseInt(page);
        } else {
            limit = 15;
            page = 1;
        }

        offset = (page - 1) * limit;
        count = await InfluxDBService.getEDCDataCount({ productName, deviceName })
        const result = await InfluxDBService.readDeviceEDCData({ productName, deviceName, limit, offset, desc: true });

        if (result && result.length) helper.responseFormat(ctx, 200, 'success', result, { limit, page, count: count[0].count });
        else helper.responseFormat(ctx, 204, 'success');
    }
}

export default dataController