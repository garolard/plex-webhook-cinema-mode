const os = require('os');
const express = require('express');
const multer = require('multer');
const { discoverGateway, TradfriClient } = require('node-tradfri-client');

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


const init = async () => {

  let client = null;

  try {
    const discoveredGateway = await discoverGateway();

    if (discoveredGateway !== null)
      console.log(`Pasarela descubierta: ${discoveredGateway.name} con IP ${discoveredGateway.addresses[0]}`);
    else
      console.log(`Ninguna pasarela descubierta, intentando conexión a IP ${config.hubIp} de config.json`);

    client = new TradfriClient(discoveredGateway === null ? config.hubIp : discoveredGateway.addresses[0]);

    const { identity, psk } = await client.authenticate(config.hubSecurityCode);
    await client.connect(identity, psk);

    client
      .on('group updated', onGroupUpdated)
      .observeGroupsAndScenes();

    setHandlers(app, client);

    app.listen(port);
    console.log('Escuchando en puerto ', port);

  } catch (e) {
    handleTradfriException(e);
    client && client.destroy();
    process.exit(1);
  }
};


function doNothingWith(event) {
  console.log('Recibido evento no manejado:', event);
}

function setHandlers(app, client) {

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
        Handlers.handleResume(client, group);
        break;
      case EventTypes.PAUSE:
        Handlers.handlePause(client, group);
        break;
      case EventTypes.STOP:
        Handlers.handleStop(client, group);
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
          client.operateGroup(group, { onOff: true, dimmer: 100 });
          res.sendStatus(200);
      });
  
  app.route('/group-off')
      .get((req, res) => {
          const group = getGroupByName(config.group, groups);
          client.operateGroup(group, { onOff: false });
          res.sendStatus(200);
      });
  
  app.route('/finish')
    .get((req, res) => {
      client.destroy();
      res.sendStatus(200);
      process.exit(0);
    });

}


init().then(_ => {});