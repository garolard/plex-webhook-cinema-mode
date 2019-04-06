const { readFileSync } = require('fs');

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
}

function readConfig() {
  console.log('Leyendo fichero de configuracion');
  const configContent = readFileSync('config.json');
  const config = JSON.parse(configContent);
  validate(config);

  return config;
}

module.exports = {
  readConfig,
};
