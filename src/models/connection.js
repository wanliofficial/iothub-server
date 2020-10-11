import mongoose from '../utils/mongodb';
const Schema = mongoose.Schema;

const connectionScheme = new Schema({
    connected: {
        type: Boolean,
        required: true
    },
    client_id: {
        type: String,
        required: true
    },
    keepalive: {
        type: Number,
        required: true
    },
    ipaddress: {
        type: String,
        required: true
    },
    proto_ver: {
        type: Number,
        required: true
    },
    connected_at: {
        type: Number,
        required: true
    },
    disconnected_at: {
        type: Number,
        required: true
    },
    conn_ack: {
        type: Number,
        required: true
    },
    device: {
        type: Schema.Types.ObjectId,
        ref: 'Device'
    }
});

connectionScheme.methods.toJSONObject = function () {
    return {
        connected: this.connected,
        client_id: this.client_id,
        ipaddress: this.ipaddress,
        connected_at: this.connected_at,
        disconnect_at: this.disconnect_at
    }
}

const Connection = mongoose.model('Connection', connectionScheme);

export default Connection