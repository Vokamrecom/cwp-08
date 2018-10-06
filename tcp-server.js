const net = require('net');
const fs = require('fs');
const  {exec }  = require("child_process");
const config = {
    port: 8124,
    pathFiles: 'E:/Files',
};

let clientCount = 0;

const server = net.createServer((client) => {
    clientCount++;
    console.log('Client connected');

    client.setEncoding('utf8');
    client.on('data', (request) => {
        let data = JSON.parse(request);
        let response;
        let workers;
        switch (data.command)
        {
            case 'list':
                workers = require('./workers.json');
                response = JSON.stringify({
                    success: true,
                    data: workers,
                });
                break;

            case 'add':
                let fileName = Date.now() + clientCount + '.json';
                let fullFileName = `${config.pathFiles}/${fileName}`;
                let command = `node worker.js ${fullFileName} ${data.number}`;
                let cProcess = exec(command);
                let worker = {
                    id:   cProcess.pid,
                    startedOn: Date.now(),
                    numbers: null,
                    fileName: fullFileName,
                };
                workers = require('./workers.json');
                workers.push(worker);
                //console.log(worker);

                fs.writeFile('./workers.json', JSON.stringify(workers), (err, data) => {
                    console.log(`rewrite workers`);
                });

                response = JSON.stringify({
                    success: true,
                    data: {
                        id: worker.id,
                        startedOn: worker.startedOn,
                    },
                });
                break;

            case 'remove':
                workers = require('./workers.json');
                for (let i = 0; i < workers.length; i++) {
                    if (workers[i].id === data.id) {
                        workers[i].numbers = require(`${workers[i].fileName}`);
                        response = JSON.stringify({
                            success: true,
                            data: workers[i],
                        });
                        workers.splice(i, 1);
                        console.log(data.id);
                        process.kill(data.id + 1);
                        break;
                    }
                }

                fs.writeFile('./workers.json', JSON.stringify(workers), (err, data) => {
                    console.log(`rewrite workers`);
                });
                break;
        }

        client.write(response);
    });

    client.on('end', () => {
        clientCount--;
        console.log('Client disconnected');
    });
});

server.listen(config.port, () => {
    console.log(`Server listening on localhost:${config.port}`);
});