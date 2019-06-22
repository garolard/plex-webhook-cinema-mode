let identity = '';
let psk = '';
let gatewayIp = '';

function saveIdentity(credentials) {
    identity = credentials.identity;
    psk = credentials.psk;
    gatewayIp = credentials.gatewayIp;
}

function getIdentity() {
    if (identity === '' || psk === '' || gatewayIp === '')
        throw new Error(`Credenciales incorrectas:\n\tIdentity: ${identity}\n\tPSK: ${psk}\n\tIP Pasarela: ${gatewayIp}`);

    return {
        identity, psk, gatewayIp
    };
}

module.exports = {
    saveIdentity,
    getIdentity
};