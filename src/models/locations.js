import mongoose from '../utils/mongodb';
const Schema = mongoose.Schema;

const locationSchema = new Schema({
    address_summary: {
        type: String,
        required: true,
        default: ""
    },
    address_detail: {
        type: Object,
        required: true,
        default: {
            province: null,
            city: null,
            district: null,
            street: null,
            street_number: null,
            city_code: null
        }
    },
    address: {
        type: String,
        required: true,
        default: ""
    },
    point: {
        type: Object,
        required: true,
        default: {
            y: 0,
            x: 0
        }
    },
    ts: {
        type: Number,
        required: true,
        default: 0
    },
    device: {
        type: Schema.Types.ObjectId,
        ref: 'Device'
    }
}, { collection: 'locations' });

locationSchema.methods.toJSONObject = function () {
    return {
        address_summary: this.address_summary,
        address_detail: this.address_detail,
        address: this.address,
        point: this.point,
        ts: this.ts
    }
}

const Location = mongoose.model("Location", locationSchema);

export default Location