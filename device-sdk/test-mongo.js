const mongoose = require('mongoose');

try {
    mongoose.connect("mongodb://iothub:123xyz@localhost:27017/iothub?authSource=iothub", { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        if (err) console.log(err);
        else console.log('connected success!');
    });
} catch(err) {
    console.log(err);
}