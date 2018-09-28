// @ts-check
const fs = require("fs");
const transpiler = require("vmf-transpiler");
const entities = require("./utils/entities");
const RopeUtils = require("./utils/rope");

const christmasLights = require("./rules/christmas_lights");

const MAP = "test_rope";

const vmf = fs.readFileSync(`./test/${MAP}.vmf`).toString();
const json = transpiler.parse(vmf, null);
fs.writeFileSync(`./test/${MAP}.json`, JSON.stringify(json, null, 2));

christmasLights(json);

fs.writeFileSync(`./test/${MAP}_christmas.vmf`, transpiler.compile(json));