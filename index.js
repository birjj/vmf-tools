// @ts-check
const path = require("path");
const transpiler = require("vmf-transpiler");
const rXmasLights = require("./rules/christmas_lights");

/**
 * Processes a VMF
 * @param {string} vmfSource The VMF to process
 * @param {object} [config] The configuration object to use
 * @return {string} The processed VMF source
 */
module.exports = function processVMF(vmfSource, config = { rules: {} }) {
    const json = transpiler.parse(vmfSource, null);

    // load config from map if it is specified
    if (json.world && json.world.vmft_config) {
        const configPath = path.resolve(process.cwd(), json.world.vmft_config);
        config = require(configPath);
    }

    // then apply all our rules
    config.rules = config.rules || {};
    rXmasLights(json, config.rules.christmas_lights);

    return transpiler.compile(json);
}