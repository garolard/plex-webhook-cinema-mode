const GroupsRepository = require('./groupsRepository');

const routes = [
    {
        path: '/',
        method: 'post',
        handler: function(req, res) {

        }
    },
    {
        path: '/list-groups',
        method: 'get',
        handler: function(_req, res) {
            GroupsRepository.findAll().map(group => console.log(group.name));
            res.sendStatus(200);
        }
    },
    {
        path: '/group-on',
        method: 'get',
        handler: function(_req, res) {
            // Inyectar cliente
            const group = GroupsRepository.findByName(config.group); // Sacar a configuracion
            client.operateGroup(group, { onOff: true, dimmer: 100 });
            res.sendStatus(200);
        }
    },
    {
        path: '/group-off',
        method: 'get',
        handler: function(_req, res) {

        }
    },
    {
        path: '/finish',
        method: 'get',
        handler: function(_req, res) {

        }
    }
];

module.exports = {
    routes
};