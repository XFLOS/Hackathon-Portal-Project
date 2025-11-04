let initialized = false;
const models = {};

function init(mongoose) {
  if (initialized) return models;
  // Lazily require model factories
  // Each model file exports a function that accepts mongoose and returns a model
  // If mongoose is not available, init should not be called.
  models.User = require('./User')(mongoose);
  models.Team = require('./Team')(mongoose);
  // Additional models can be added here
  initialized = true;
  return models;
}

function isInitialized() {
  return initialized;
}

function get(name) {
  return models[name];
}

module.exports = { init, isInitialized, get };
