import mongoose from '../utils/mongodb';
const Schema = mongoose.Schema;

const userSchema = new Schema({
    openid: String,
    session_key: String,
    nickName: String,
    avatarUrl: String,
    gender: Number,
    country: String,
    province: String,
    city: String,
    language: String,
    createTime: String
}, { collection: 'wx_users' });

userSchema.methods.toJSONObject = function () {
    return {
        openid: this.openid,
        session_key: this.session_key,
        nickName: this.nickName,
        avatarUrl: this.avatarUrl,
        country: this.country,
        province: this.province,
        city: this.city,
        language: this.language,
        createTime: this.createTime
    }
}

const User = mongoose.model("User", userSchema);

export default User