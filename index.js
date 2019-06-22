const os = require('os');
const express = require('express');
const multer = require('multer');
const { discoverGateway, TradfriClient } = require('node-tradfri-client');

const GroupsRepository = require('./groupsRepository');
const IdentityRepository = require('./identityRepository');
const Handlers = require('./handlers');
const { readConfig } = require('./config');
const { addRoutes, mustHandleEvent, handleTradfriException } = require('./utils');
const { routes } = require('./routes');

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

const init = async () => {

  let client = null;

  try {
    const discoveredGateway = await discoverGateway();

    if (discoveredGateway !== null) {
      client = new TradfriClient(discoveredGateway.addresses[0]);
      console.log(`Pasarela descubierta: ${discoveredGateway.name} con IP ${discoveredGateway.addresses[0]}`);
    } else {
      client = new TradfriClient(config.hubIp);
      console.log(`Ninguna pasarela descubierta, intentando conexión a IP ${config.hubIp} de config.json`);
    }

    const gatewayIp = discoveredGateway !== null ? discoveredGateway.addresses[0] : config.hubIp;
    const { identity, psk } = await client.authenticate(config.hubSecurityCode);

    await client.connect(identity, psk);

    client
      .on('group updated', GroupsRepository.addOrUpdateGroup)
      .observeGroupsAndScenes();

    //setHandlers(app, client);
    addRoutes(app, routes);

    app.listen(port);
    console.log('Escuchando en puerto ', port);

    IdentityRepository.saveIdentity({ identity, psk, gatewayIp });
    client.destroy();

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
  
    const group = GroupsRepository.findByName(config.group);
  
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
  
  app.route('/group-on')
      .get((req, res) => {
          const group = GroupsRepository.findByName(config.group); // Sacar a configuracion
          client.operateGroup(group, { onOff: true, dimmer: 100 });
          res.sendStatus(200);
      });
  
  app.route('/group-off')
      .get((req, res) => {
          const group = GroupsRepository.findByName(config.group);
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