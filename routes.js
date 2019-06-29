const GroupsRepository = require('./groupsRepository');
const Operator = require('./clientOperator');

const { asyncHandler } = require('./utils');

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
            const listedGroups = GroupsRepository.findAll()
                .map(g => g.name)
                .join(', ');

            res.setHeader('content-type', 'text/plain;charset=utf-8');
            res.status(200).send(listedGroups);
        }
    },
    {
        path: '/group-on',
        method: 'get',
        handler: asyncHandler(async function(_req, res) {
            const group = GroupsRepository.findByName('Salón'); // Sacar a configuracion
            await Operator.doWithClient(async client => await client.operateGroup(group, { onOff: true, dimmer: 100 }));
            res.sendStatus(200);
        })
    },
    {
        path: '/group-off',
        method: 'get',
        handler: asyncHandler(async function(_req, res) {
            const group = GroupsRepository.findByName('Salón'); // Sacar a configuracion
            await Operator.doWithClient(async client => await client.operateGroup(group, { onOff: false }));
            res.sendStatus(200);
        })
    },
    {
        path: '/finish',
        method: 'get',
        handler: function(_req, res) {
            Operator.destroyClient();
            res.status(200).send('Aplicación terminada');
            process.exit(0);
        }
    },
    {
        path: '/micuarto',
        method: 'get',
        handler: asyncHandler(async function(_req, res) {
            const group = GroupsRepository.findByName('Cuarto de Gabi');
            await Operator.doWithClient(async client => await client.operateGroup(group, { onOff: !group.onOff }));
            res.status(200).send(`${group.onOff ? 'Apagando' : 'Encendiendo'} ${group.name}`);
        })
    }
];

module.exports = {
    routes
};