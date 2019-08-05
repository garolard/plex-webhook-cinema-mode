const fs = require('fs');

function log(msg, severity) {
    if (severity !== 'warn' && severity !== 'error') // Hacer configurable que pinte tambien los de debug
        return;

    const stream = fs.createWriteStream('./log.txt', { flags: 'a' });
    stream.write(`${(new Date()).toLocaleString()} - ${severity}:\t${msg}\n`);
    stream.end();
}

module.exports = {
    log
}