const { TradfriClient } = require('node-tradfri-client');
const { handleTradfriException } = require('./utils');

let client = null;

async function initClient(ipAddress, hubSecurityCode) {
    if (client !== null)
        return;

    client = new TradfriClient(ipAddress);

    try {
        console.log('Autenticando cliente');

        const { identity, psk } = await client.authenticate(hubSecurityCode);
        await client.connect(identity, psk);

    } catch (e) {
        handleTradfriException(e);
        client && client.destroy();
        process.exit(1);
    }
}

async function doWithClient(func) {
    if (client === null)
        throw new Error('El cliente no está inicializado');

    try {
        await func(client);
    } catch (e) {
        handleTradfriException(e);
        client && client.destroy();
        process.exit(1);
    }
}

function destroyClient() {
    client && client.destroy();
}

module.exports = {
    initClient,
    doWithClient,
    destroyClient
}