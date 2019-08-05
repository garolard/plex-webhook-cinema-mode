async function handleResume(client, group) {
  await client.operateGroup(group, {
    onOff: false,
    transitionTime: 2,
  });
}

async function handlePause(client, group) {
  await client.operateGroup(group, {
    onOff: true,
    dimmer: 35,
    transitionTime: 1,
  });
}

async function handleStop(client, group) {
  await client.operateGroup(group, {
    onOff: true,
    dimmer: 100,
    transitionTime: 2,
  });
}

module.exports = {
  handleResume,
  handlePause,
  handleStop,
};
