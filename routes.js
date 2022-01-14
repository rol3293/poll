const routes = require('next-routes')();

routes
    .add('/vote/:address', '/vote/index');

module.exports = routes;
