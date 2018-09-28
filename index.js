// @ts-check
const transpiler = require("vmf-transpiler");
const rXmasLights = require("./rules/christmas_lights");

/**
 * Processes a VMF
 * @param {string} vmfSource The VMF to process
 * @param {object} [config] The configuration object to use
 * @return {string} The processed VMF source
 */
module.exports = function processVMF(vmfSource, config = { rules: {} }) {
    config.rules = config.rules || {};
    const json = transpiler.parse(vmfSource, null);

    // TODO: load config from map if present

    rXmasLights(json, config.rules.christmas_lights);

    return transpiler.compile(json);
}