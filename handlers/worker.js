const errors = require('../errors.json');
const net = require('net');
const config = {
    port: 8124,
};

const client = new net.Socket();

client.setEncoding('utf8');
client.connect(config.port, function() {
    console.log('Connected to tcp-server');
});

class Worker
{
    getList(req, res, payload, cb)
    {
        client.once("data", response => {
            response = JSON.parse(response);
            if (response.success) {
                cb(null, response.data);
            } else {
                cb(errors.invalidRequest, null);
            }
        });
        client.write(JSON.stringify({
            command: 'list',
        }));
    }

    add(req, res, payload, cb)
    {
        client.once("data", response => {
            response = JSON.parse(response);
            if (response.success) {
                cb(null, response.data);
            } else {
                cb(errors.invalidRequest, null);
            }
        });
        client.write(JSON.stringify({
            command: 'add',
            number: payload.number,
        }));
    }

    remove(req, res, payload, cb)
    {
        client.once("data", response => {
            response = JSON.parse(response);
            if (response.success) {
                cb(null, response.data);
            } else {
                cb(errors.invalidRequest, null);
            }
        });
        client.write(JSON.stringify({
            command: 'remove',
            id: payload.id,
        }));
    }
}

exports.Worker = Worker;