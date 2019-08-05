const express = require('express');

const GroupsRepository = require('./groupsRepository');
const Client = require('./client');
const { readConfig } = require('./config');
const { addRoutes, handleTradfriException } = require('./utils');
const { routes } = require('./routes');

const config = readConfig();
const app = express();
const port = config.port || 3000;

const init = async () => {

  Client.config(config);
  let client = null;

  try {
    client = await Client.getInstance();

    client
      .on('group updated', GroupsRepository.addOrUpdateGroup)
      .observeGroupsAndScenes();

    addRoutes(app, routes);
    app.listen(port);
    console.log(`Escuchando en puerto ${port}`);
  } catch (e) {
    handleTradfriException(e);
    client && client.destroy();
    process.exit(1);
  }
  
};

Promise.resolve(init());