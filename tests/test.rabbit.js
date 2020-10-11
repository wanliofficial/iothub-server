const amqp = require('amqplib/callback_api');

const topic = 'hello';

function publisher(conn) {
    conn.createChannel(on_open);
    function on_open(err, ch) {
        if (err != null) console.error(err);
        ch.assertQueue(topic);
        ch.sendToQueue(topic, new Buffer('something to do'));
    }
}
function consumer(conn) {
    conn.createChannel(on_open);
    function on_open(err, ch) {
        if (err != null) console.error(err);
        ch.assertQueue(topic);
        ch.consume(topic, function(msg) {
            if (msg !== null) {
                console.log('consumer', msg.content.toString());
                ch.ack(msg);
            }
        });
    }
}
amqp.connect('amqp://guest:guest@localhost', function(err, conn) {
    consumer(conn);
    publisher(conn);
});