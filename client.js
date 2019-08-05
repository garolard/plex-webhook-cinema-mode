const assert = require('assert');
const { TradfriClient } = require('node-tradfri-client');
const { discoverGateway } = require('node-tradfri-client');

const { log } = require('./logger');

let _config = null;
let _instance = null;

function config(config) {
    console.log(`Guardando configuracion ${JSON.stringify(config)}`);
    _config = config;
}

async function getInstance() {
    if (_instance === null)
        await initClient();

    return _instance;
}

async function initClient() {
    assert.notStrictEqual(_config, null);

    const gateaway = await discoverGateway();
    const clientOptions = {
        customLogger: log,
        useRawCoAPValues: false,
        watchConnection: true
    };

    console.log(`Conectando a ${gateaway ? gateaway.addresses[0] : _config.hubIp}`);
    if (gateaway !== null) {
        _instance = new TradfriClient(gateaway.addresses[0], clientOptions);
    } else {
        _instance = new TradfriClient(_config.hubIp, clientOptions);
    }

    const { identity, psk } = await _instance.authenticate(_config.hubSecurityCode);
    await _instance.connect(identity, psk);
}

module.exports = {
    config,
    getInstance
};