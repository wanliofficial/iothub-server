import mongoose from '../utils/mongodb';
const Schema = mongoose.Schema;

const deviceACLSchema = new Schema({
    broker_username: String,
    publish: Array,
    subscribe: Array,
    pubsub: Array
}, { collection: 'device_acl' });

const DeviceACL = mongoose.model('DeviceACL', deviceACLSchema);

export default DeviceACL;