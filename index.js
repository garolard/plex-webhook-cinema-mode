const os = require('os');
const express = require('express');
const multer = require('multer');
const { TradfriClient } = require('node-tradfri-client');

const { readConfig } = require('./config');
const { mustHandleEvent, getGroupByName, handleTradfriException } = require('./utils');
const Handlers = require('./handlers');

const EventTypes = {
  PLAY: 'media.play',
  RESUME: 'media.resume',
  PAUSE: 'media.pause',
  STOP: 'media.stop',
};

// VARIABLES DE APLICACION
const config = readConfig();
const upload = multer({ dest: os.tmpdir() });
const app = express();
const port = config.port || 3000;
const groups = {};

// MÉTODOS PARA CONECTARSE AL HUB Y REGISTRAR LOS EVENTOS DEL MISMO
function onGroupUpdated(group) {
  groups[group.instanceId] = group;
}

const connect = client => ({identity, psk}) => client.connect(identity, psk);

const registerEventsFor = client => () => {
  console.log('conectando');
  client
    .on('group updated', onGroupUpdated)
    .observeGroupsAndScenes();

  app.listen(port);
  console.log('Escuchando en puerto ', port);
};

// CONEXIÓN AL HUB
const tradfriClient = new TradfriClient(config.hubIp);

const init = async () => {
  try {
    const { identity, psk } = await tradfriClient.authenticate(config.hubSecurityCode);
    await tradfriClient.connect(identity, psk);

    tradfriClient
      .on('group updated', onGroupUpdated)
      .observeGroupsAndScenes();

    app.listen(port);
    console.log('Escuchando en puerto ', port);

  } catch (e) {
    handleTradfriException(e);
    tradfriClient.destroy();
    process.exit(1);
  }
};

// tradfriClient.authenticate(config.hubSecurityCode)
//   .then(connect(tradfriClient))
//   .then(registerEventsFor(tradfriClient))
//   .catch(e => {
    
//   });


// ENDPOINTS DEL SERVICIO
function doNothingWith(event) {
  console.log('Recibido evento no manejado:', event);
}

app.post('/', upload.single('thumb'), (req, res) => {
  const plexPayload = JSON.parse(req.body.payload);

  if (config.logPayload && config.logPayload === true) {
    console.log(plexPayload);
  }

  if (!mustHandleEvent(plexPayload, config.user, config.player)) {
    res.sendStatus(200);
    return;
  }

  const group = getGroupByName(config.group, groups);

  switch (plexPayload.event) {
    case EventTypes.PLAY:
    case EventTypes.RESUME:
      Handlers.handleResume(tradfriClient, group);
      break;
    case EventTypes.PAUSE:
      Handlers.handlePause(tradfriClient, group);
      break;
    case EventTypes.STOP:
      Handlers.handleStop(tradfriClient, group);
      break;
    default:
      doNothingWith(plexPayload.event);
  }

  res.sendStatus(200);
});

app.route('/list-groups')
  .get((req, res) => {
    const ids = Object.keys(groups);
    ids.map(id => console.log(groups[id].name));
    res.sendStatus(200);
  });

app.route('/group-on')
    .get((req, res) => {
        const group = getGroupByName(config.group, groups); // Sacar a configuracion
        tradfriClient.operateGroup(group, { onOff: true, dimmer: 100 });
        res.sendStatus(200);
    });

app.route('/group-off')
    .get((req, res) => {
        const group = getGroupByName(config.group, groups);
        tradfriClient.operateGroup(group, { onOff: false });
        res.sendStatus(200);
    });

app.route('/finish')
  .get((req, res) => {
    tradfriClient.destroy();
    res.sendStatus(200);
    process.exit(0);
  });

init().then(_ => {});