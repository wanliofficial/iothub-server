import UUID from 'uuid'
import crypto from 'crypto'

export function generateID() {
    return UUID.v4().replace(/-/g, "");
}

export function formatTime (date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const formatNumber = (n) => {
        n = n.toString();
        return n[1] ? n : '0' + n;
    }

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

export function parseTime(time, cFormat) {
    if (arguments.length === 0) return null
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
    let date = null
    if (typeof time === 'object') date = time
    else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) time = parseInt(time)
        if ((typeof time === 'number') && (time.toString().length === 10)) time = time * 1000
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
        if (result.length > 0 && value < 10) value = '0' + value
        return value || 0
    })
    return time_str
}

export function getNowFormatDate(days) {
    let date = new Date();
    if (days) {
        days = days * 1000 * 60 * 60 * 24
        date = new Date(new Date().getTime() + days)
    }
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month >= 1 && month <= 9) month = "0" + month;
    if (day >= 0 && day <= 9) day = "0" + day;
    return `${year}-${month}-${day}`;
}

export function fillZero(value, length) {
    if (length > 0 && value > 0) {
        if (String(value).length < length) return new Array(length - String(value).length + 1).join("0") + value;
        else return value;
    } else return value;
}


export function mapTrim(source) {
    let t = {};
    for (let item in source) {
        if (source[item] != null) {
            if (typeof(source[item]) === 'string') t[item] = source[item].trim();
            else t[item] = source[item];
        }
    }
    return t;
}

export function getSha1(str) {
    let sha1 = crypto.createHash("sha1");
    sha1.update(str);
    return sha1.digest("hex");
}

export function isJSON (str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) return true;
            else return false;

        } catch(e) {
            return false;
        }
    }
    return false;
}