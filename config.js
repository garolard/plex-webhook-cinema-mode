const { existsSync, readFileSync } = require('fs');

const CONFIG_FILE_PATH = './config.json';

function validate(config) {
  if (!config.hubIp || config.hubIp === '') {
    throw new Error('Es obligatorio indicar la propiedad "hubIp" en el fichero de configuración config.json.');
  }

  if (!config.hubSecurityCode || config.hubSecurityCode === '') {
    throw new Error('Es obligatorio indicar la propiedad "hubSecurityCode" en el fichero de configuración config.json.');
  }

  if (!config.group || config.group === '') {
    throw new Error('Es obligatorio indicar la propiedad "group" en el fichero de configuración config.json.');
  }

  if (!config.user || config.user === '') {
    throw new Error('Es obligatorio indicar la propiedad "user" en el fichero de configuración config.json.');
  }

  if (!config.player || config.player === '') {
    throw new Error('Es obligatorio indicar la propiedad "player" en el fichero de configuración config.json.');
  }
}

function readConfig() {
  const existsConfig = existsSync(CONFIG_FILE_PATH);
  if (!existsConfig)
    throw new Error(`No se encuentra el fichero de configuración '${CONFIG_FILE_PATH}'.`);

  const content = readFileSync(CONFIG_FILE_PATH);
  const config = JSON.parse(content);

  validate(config);

  return config;
}

module.exports = {
  readConfig,
};
