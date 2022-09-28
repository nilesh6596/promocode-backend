const appRoutes = require('./app');
const promotionCodeRoute = require('./promotionCode');

module.exports = function (app) {
  app.use('/', appRoutes);
  app.use('/api', promotionCodeRoute);
}
