const path = require('path');
const { Service } = require('node-windows');

const svc = new Service({
  name: 'Plex Cinema Mode',
  description: 'Cliente para Plex Webhooks e IKEA Tradfri para simular un modo cine',
  script: path.join(__dirname, '/index.js'),
});

svc.on('install', () => svc.start());

svc.install();
