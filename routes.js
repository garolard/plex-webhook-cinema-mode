const os = require('os');
const multer = require('multer');

const GroupsRepository = require('./groupsRepository');
const Client = require('./client');
const EventTypes = require('./EventTypesEnum');

const { asyncHandler, mustHandleEvent, doNothingWith, handleTradfriException } = require('./utils');
const { readConfig } = require('./config');
const { handleResume, handlePause, handleStop } = require('./eventHandlers');


const upload = multer({ dest: os.tmpdir() });
const _config = readConfig();

const routes = [
    {
        path: '/',
        method: 'post',
        handler: upload.single('thumb'),
        next: asyncHandler(async function(req, res) {
            const plexPayload = JSON.parse(req.body.payload);
  
            if (!mustHandleEvent(plexPayload, _config.user, _config.player)) {
                res.sendStatus(200);
                return;
            }

            const client = await Client.getInstance();
            const group = GroupsRepository.findByName(_config.group);
  
            try {
                switch (plexPayload.event) {
                  case EventTypes.PLAY:
                  case EventTypes.RESUME:
                    await handleResume(client, group);
                    break;
                  case EventTypes.PAUSE:
                    await handlePause(client, group);
                    break;
                  case EventTypes.STOP:
                    await handleStop(client, group);
                    break;
                  default:
                    doNothingWith(plexPayload.event);
                }
              
                res.sendStatus(200);
            } catch (e) {
                handleTradfriException(e);
                res.status(500).send(e);
            }
        })
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
            const group = GroupsRepository.findByName(_config.group);

            try {
                const client = await Client.getInstance();
                await client.operateGroup(group, { onOff: true, dimmer: 100 });
                res.sendStatus(200);
            } catch (e) {
                handleTradfriException(e);
                res.status(500).send(e);
            }            
        })
    },
    {
        path: '/group-off',
        method: 'get',
        handler: asyncHandler(async function(_req, res) {
            const group = GroupsRepository.findByName(_config.group);
            try {
                const client = await Client.getInstance();
                await client.operateGroup(group, { onOff: false });
                res.sendStatus(200);
            } catch (e) {
                handleTradfriException(e);
                res.status(500).send(e);
            }
        })
    },
    {
        path: '/finish',
        method: 'get',
        handler: asyncHandler(async function(_req, res) {
            const client = await Client.getInstance();
            client.destroy();
            res.status(200).send('Aplicación terminada');
            process.exit(0);
        })
    },
    {
        path: '/micuarto',
        method: 'get',
        handler: asyncHandler(async function(_req, res) {
            const group = GroupsRepository.findByName(_config.group);
            try {
                const client = await Client.getInstance();
                await client.operateGroup(group, { onOff: !group.onOff });
                res.status(200).send(`${group.onOff ? 'Apagando' : 'Encendiendo'} ${group.name}`);
            } catch (e) {
                handleTradfriException(e);
                res.status(500).send(e);
            }
        })
    }
];

module.exports = {
    routes
};