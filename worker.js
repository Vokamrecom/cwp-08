const fs = require('fs');

let pathFile = process.argv[2];
let number = process.argv[3];
const numbers = [];
if (pathFile === undefined || number === undefined) {
    console.log('need add two params: pathFile and number');
} else {
    number = parseInt(number);

    setInterval(function () {
        numbers.push(number);
        fs.writeFile(pathFile, JSON.stringify(numbers), (err, data) => {
            console.log(`added ${number} in file ${pathFile}\n`);
        });
    }, number * 1000);
}