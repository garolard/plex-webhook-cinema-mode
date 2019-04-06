function mustHandleEvent({ Account: { title }, Metadata: { type } }, user) {
  if (title !== user) {
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

function getGroupByName(groupName, groups) {
  const ids = Object.keys(groups);

  if (ids.length === 0) {
    return null;
  }

  return ids.filter(id => groups[id].name === groupName).map(id => groups[id])[0];
}

module.exports = {
  mustHandleEvent,
  getGroupByName,
};
