Object.prototype.clone = function() {
    let newObj = (this instanceof Array) ? [] : {};
    for (let i in this) {
        if (i === 'clone')
            continue;
        if (this[i] && typeof this[i] === "object") {
            newObj[i] = this[i].clone();
        }
        else newObj[i] = this[i]
    }
    return newObj;
};

const http = require('http');
const fs = require('fs');
const path = require('path');

const classes = {
    worker: require("./handlers/worker"),
};

const controllers = {
    worker: new classes.worker.Worker(),
};

/*const data = {
    articles: require("./fixtures/articles.json")
};*/

const config = {
    hostname: '127.0.0.1',
    port: 3000,
    rootPath: 'public',
    defaultLoadFile: 'index.html',
};
const handlers = {
    '/workers': controllers.worker.getList,
    '/workers/add': controllers.worker.add,
    '/workers/remove': controllers.worker.remove,
};

const server = http.createServer((req, res) => {
    let response = "";
    parseBodyJson(req, (err, payload) => {
        res.setHeader('Content-Type', 'application/json');
        if (err) {
            res.statusCode = err.code;
            response = JSON.stringify(err);
            res.end( response );

            return;
        }

        let handler = getHandler(req.url);
        if (handler === null) {
            let pathFile = config.rootPath + req.url;

            if (req.url === '/') {
                pathFile += config.defaultLoadFile;
            }

            if (fs.existsSync(pathFile)) {
                fs.readFile(pathFile, {}, (err, data) => {
                    let type = defineContentType(path.extname(pathFile));
                    res.setHeader('Content-Type', type);
                    res.statusCode = 200;
                    res.end( data );
                });

                return;

            } else {
                handler = notFound;
            }
        }

//const start = handler.bind(data);

        handler(req, res, payload, (err, result) => {
            if (err) {
                res.statusCode = err.code;
                response = JSON.stringify(err);
                res.end( response );

                return;
            }

            res.statusCode = 200;
            response = JSON.stringify(result);
            res.end( response );
//writeLogs({url: req.url, response: response});
        });

    });
});

server.listen(config.port, config.hostname, () => {
    console.log(`Server running at http://${config.hostname}:${config.port}/`);
});

const writeLogs = (data) => {

    const today = new Date();
    const filePath = `logs/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}.json`;
    const logs = fs.existsSync(filePath) ? require('./' + filePath) : [];
    const log = {
        date: today.toString(),
        url: data.url,
        response: data.response
    };
    if (log.url === '/api/logs') {
        log.response = null;
    }
    logs.push(log);

    const logsForWriting = JSON.stringify(logs);
    fs.writeFileSync(filePath, logsForWriting);
};

function getHandler(url) {
    return handlers[url] || null;
}

function defineContentType(ext)
{
    switch (ext)
    {
        case '.html': return 'text/html';
        case '.js': return 'text/js';
        case '.css': return 'text/css';
    }
}

function notFound(req, res, payload, cb) {
    cb({ code: 404, message: 'Page not found'});
}

function invalidRequest(cb) {
    cb({code: 400, message: "Request invalid"}, null);
}

function parseBodyJson(req, cb) {
    let body = [];

    req.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = Buffer.concat(body).toString();

        let params = "";
        if (body !== "") {
            try {
                params = JSON.parse(body);
            } catch(e) {
                invalidRequest(cb);
                return;
            }
        }

        cb(null, params);
    });
}