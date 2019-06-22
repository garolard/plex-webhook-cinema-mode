// Ya se que esto no es un repository pero no se me ocurre nombre mejor

const groups = {};

function addOrUpdateGroup(group) {
    groups[group.instanceId] = group;
}

function findAll() {
    return Object.keys(groups).map(id => groups[id]);
}

function findByName(groupName) {
    const ids = Object.keys(groups);

    if (ids.length === 0) {
        return null;
    }

    // Esto sería una pasada si estuviera materializando
    // objetos de DB a memoria, pero como todo está en memoria
    // pues me la pela
    return ids.map(id => groups[id]).filter(group => group.name === groupName)[0];
}

module.exports = {
    addOrUpdateGroup: addOrUpdateGroup,
    findAll: findAll,
    findByName: findByName
};