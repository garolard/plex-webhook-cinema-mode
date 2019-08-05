const { TradfriError, TradfriErrorCodes } = require('node-tradfri-client');

function mustHandleEvent({ Account: { title }, Metadata: { type }, Player: { uuid } }, user, playerUuid) {
  if (title !== user) {
    return false;
  }

  if (uuid !== playerUuid) {
    return false;
  }

  if (type !== 'episode' && type !== 'movie') {
    return false;
  }

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

  if (currentTime.getHours() < startTime.getHours()
    && currentTime.getHours() > endTime.getHours()) {
    return false;
  }

  return true;
}

function handleTradfriException(e) {
  if (e instanceof TradfriError) {
    switch (e.code) {
      case TradfriErrorCodes.ConnectionTimedOut:
        console.error('Timeout de conexión: ', e.message);
        break;
      case TradfriErrorCodes.AuthenticationFailed:
        console.error('Autenticación fallida: ', e.message);
        break;
      case TradfriErrorCodes.ConnectionFailed:
        console.error('Conexión fallida: ', e.message);
        break;
      default:
        console.error('No se pudo realizar la conexión del cliente a la pasarela: ', e.message);
    }
  } else {
    console.error('Error desconocido: ', e);
  }
}

function addRoutes(app, routes) {
  for (route of routes) {
    const { method, path, handler, next } = route;
    next 
      ? app[method](path, handler, next)
      : app[method](path, handler);
  }
}

const asyncHandler = fn => (req, res, next) => {
  Promise
      .resolve(fn(req, res, next))
      .catch(next);
}

function doNothingWith(event) {
  console.log('Recibido evento no manejado:', event);
}

module.exports = {
  mustHandleEvent,
  handleTradfriException,
  addRoutes,
  asyncHandler,
  doNothingWith
};
