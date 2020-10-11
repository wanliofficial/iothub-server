import mongoose from '../utils/mongodb';
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    message_id: String,
    product_name: String,
    device_name: String,
    data_type: String,
    payload: Buffer,
    send_at: String
}, { collection: 'messages' });

messageSchema.methods.toJSONObject = function () {
    return {
        product_name: this.product_name,
        device_name: this.device_name,
        send_at: this.send_at,
        data_type: this.data_type,
        message_id: this.message_id,
        payload: this.payload.toString("base64")
    }
}

const Message = mongoose.model("Message", messageSchema);

export default Message