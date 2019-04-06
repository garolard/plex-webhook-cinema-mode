function handleResume(client, group) {
  console.log('Apagando...');
  client.operateGroup(group, {
    onOff: false,
    transitionTime: 2,
  }).then(() => console.log('Apagado', group, '...'));
}

function handlePause(client, group) {
  console.log('Encendiendo un poco...');
  client.operateGroup(group, {
    onOff: true,
    dimmer: 35,
    transitionTime: 1,
  }).then(() => console.log('Encendido', group, 'un poco...'));
}

function handleStop(client, group) {
  console.log('Encendiendo...');
  client.operateGroup(group, {
    onOff: true,
    dimmer: 100,
    transitionTime: 2,
  }).then(() => console.log('Encendido', group, '...'));
}

module.exports = {
  handleResume,
  handlePause,
  handleStop,
};
