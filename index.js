const express = require('express');
const multer = require('multer');
const { TradfriClient } = require('node-tradfri-client');
const readConfig = require('./config').readConfig;


const EventTypes = {
    PLAY: 'media.play',
    RESUME: 'media.resume',
    PAUSE: 'media.pause',
    STOP: 'media.stop'
}

///////////////////////////////////////////////////////////////////
// VARIABLES DE APLICACION
//////////////////////////////////////////////////////////////////

const config = readConfig();
const upload = multer({ dest: 'C:/Windows/Temp/' });
const app = express();
const port = process.env.port || 3000;
const groups = {};



///////////////////////////////////////////////////////////////////
// MÉTODOS PARA CONECTARSE AL HUB Y REGISTRAR LOS EVENTOS DEL MISMO
///////////////////////////////////////////////////////////////////

const connectClient = (client) => ({ identity, psk }) => client.connect(identity, psk);

const registerEvents = () => {
    tradfriClient
        .on("group updated", tradfri_groupUpdated)
        .observeGroupsAndScenes();

    app.listen(port);

    console.log('Escuchando en puerto ', port);
};

function tradfri_groupUpdated(group) {
    groups[group.instanceId] = group;
}



///////////////////////////////////////////////////////////////////
// CONEXIÓN AL HUB
///////////////////////////////////////////////////////////////////
const tradfriClient = new TradfriClient(config.hubIp);

tradfriClient.authenticate(config.hubSecurityCode)
    .then(connectClient(tradfriClient))
    .then(registerEvents)
    .catch((reason) => {
        tradfriClient.destroy();
        throw new Error(reason);
    });



///////////////////////////////////////////////////////////////////
// ENDPOINTS DEL SERVICIO
///////////////////////////////////////////////////////////////////

app.post('/', upload.single('thumb'), (req, res, next) => {
    const plexPayload = JSON.parse(req.body.payload);

    if (config.logPayload && config.logPayload === true)
        console.log(plexPayload);

    if (!mustHandleEvent(plexPayload)) {
        res.sendStatus(200);
        return;
    }

    switch (plexPayload.event) {
        case EventTypes.PLAY:
        case EventTypes.RESUME:
            handleResume();
            break;
        case EventTypes.PAUSE:
            handlePause();
            break;
        case EventTypes.STOP:
            handleStop();
            break;
        default:
            doNothingWith(plexPayload.event);
    }

    res.sendStatus(200);
});


function mustHandleEvent({ Account: { title }, Metadata: { type } }) {
    if (title !== config.user)
        return false;
    
    if (type !== 'episode' && type !== 'movie')
        return false;
    
    // ¿Más configuracion?
    const startTimeWindow = '20:00:00';
    const endTimeWindow = '08:00:00';
    
    const currentTime = new Date();
    const startTime = new Date();
    const endTime = new Date();

    startTime.setHours(startTimeWindow.split(':')[0]);
    startTime.setMinutes(startTimeWindow.split(':')[1]);
    startTime.setSeconds(startTimeWindow.split(':')[2]);

    endTime.setHours(endTimeWindow.split(':')[0]);
    endTime.setMinutes(endTimeWindow.split(':')[1]);
    endTime.setSeconds(endTimeWindow.split(':')[2]);

    if (currentTime.getHours() < startTime.getHours() && currentTime.getHours() > endTime.getHours())
        return false;
    
    return true;
}

function handleResume() {
    console.log('Apagando...');
    const salon = getGroupByName(config.group);
    tradfriClient.operateGroup(salon, {
        onOff: false,
        transitionTime: 2
    }).then(() => console.log('Apagado', config.group, '...'));
}

function handlePause() {
    console.log('Encendiendo un poco...');
    const salon = getGroupByName(config.group);
    tradfriClient.operateGroup(salon, {
        onOff: true,
        dimmer: 35,
        transitionTime: 1
    }).then(() => console.log('Encendido', config.group, 'un poco...'));
}

function handleStop() {
    console.log('Encendiendo...');
    const salon = getGroupByName(config.group);
    tradfriClient.operateGroup(salon, {
        onOff: true,
        dimmer: 100,
        transitionTime: 2
    }).then(() => console.log('Encendido', config.group, '...'));
}

function doNothingWith(event) {
    console.log('Recibido evento no manejado:', event);
}

app.route('/list-groups')
    .get((req, res) => {
        const ids = Object.keys(groups);
        for (let id of ids) {
            console.log(groups[id].name);
        }
        res.sendStatus(200);
    });

// app.route('/group-on')
//     .get((req, res) => {
//         const group = getGroupByName(config.group); // Sacar a configuracion
//         tradfriClient.operateGroup(group, { onOff: true, dimmer: 100 });
//         res.sendStatus(200);
//     });

// app.route('/group-off')
//     .get((req, res) => {
//         const group = getGroupByName(config.group);
//         tradfriClient.operateGroup(group, { onOff: false });
//         res.sendStatus(200);
//     });

app.route('/finish')
    .get((req, res) => {
        tradfriClient.destroy();
        res.sendStatus(200);
        process.exit(0);
    });

function getGroupByName(groupName) {
    const ids = Object.keys(groups);
    if (ids.length == 0)
        return null;
    
    for (let id of ids) {
        if (groups[id].name === groupName)
            return groups[id];
    }

    return null;
}