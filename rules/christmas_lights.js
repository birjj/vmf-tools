// @ts-check
const Vector = require("../utils/vector");
const RopeUtils = require("../utils/rope");
const entities = require("../utils/entities");

const GLOW_SPRITE = {
    "id": "1588",
    "classname": "env_sprite",
    "disablereceiveshadows": "0",
    "disableX360": "0",
    "fademaxdist": "0",
    "fademindist": "-1",
    "fadescale": "1",
    "framerate": "10.0",
    "GlowProxySize": "2.0",
    "HDRColorScale": "1.0",
    "maxcpulevel": "0",
    "maxgpulevel": "0",
    "mincpulevel": "0",
    "mingpulevel": "0",
    "model": "sprites/glow01.spr",
    "renderamt": "255",
    "rendercolor": "255 255 255",
    "renderfx": "0",
    "rendermode": "3",
    "spawnflags": "0",
    "origin": "-6 -96 50",
    "editor": {
        "color": "135 104 0",
        "groupid": "1732",
        "visgroupshown": "1",
        "visgroupautoshown": "1",
        "logicalpos": "[0 1500]"
    }
};
const COLORS = ["255 0 0", "0 255 0", "0 0 255", "255 255 0", "255 0 255", "0 255 255"];
const getColor = (() => {
    let i = 0;
    return () => COLORS[i++ % COLORS.length];
})();

/**
 * @typedef ChristmasLightsConfig
 * @property {(start, end) => boolean} [shouldAddLights] Should return a boolean indicating whether we should process the rope
 * @property {(start, end) => number} [getNumLights] Should return the number of lights we should put on the rope section
 * @property {(pos: number[], i: number, start, end) => object} [getLightEntity] Should return the entity to insert as the light
 */
/** @type {ChristmasLightsConfig} */
const DEFAULT_CONFIG = {
    shouldAddLights(start) {
        return +start.vmft_xmas === 1;
    },

    getNumLights(start, end) {
        const originToVector = origin => {
            const parsed = origin.split(" ").map(v => +v);
            return new Vector(parsed[0], parsed[1], parsed[2]);
        };
        return Math.floor(
            originToVector(start.origin).subtract(originToVector(end.origin)).length() / 32
        );
    },

    getLightEntity(pos) {
        const newSprite = Object.assign({}, GLOW_SPRITE);
        newSprite.editor = Object.assign({}, GLOW_SPRITE.editor);
        newSprite.origin = pos.map(v => Math.round(v)).join(" ");
        newSprite.rendercolor = getColor();
        return newSprite;
    }
};

/**
 * Put lights on every rope
 * @param {object} json The JSON representation of the map
 * @param {ChristmasLightsConfig} [config] An optional config
 */
module.exports = function christmasLights(json, config = {}) {
    config = Object.assign({}, DEFAULT_CONFIG, config);

    // ropes start from a move_rope and go through (up to) several keyframe_ropes
    // we should apply to each move_rope->keyframe_rope or keyframe_rope->keyframe_rope
    let outpEnts = [];
    const ropes = entities.getByClassname(json, "move_rope");
    ropes.forEach(rope => {
        const keyframes = RopeUtils.getRopeKeyframes(json, rope);
        for (let i = 1; i < keyframes.length; ++i) {
            const startKeyframe = keyframes[i-1];
            const endKeyframe = keyframes[i];
            console.log("[christmas_lights] Calculating for rope", startKeyframe.targetname, startKeyframe.Slack, startKeyframe.Subdiv);
            // if we have already processed the rope (in a previous run on the VMF), skip it
            if (+startKeyframe.vmft_xmas_processed 
                    || +startKeyframe.vmft_xmas === 0
                    || (!config.shouldAddLights(startKeyframe, endKeyframe) && +startKeyframe.vmft_xmas !== 1)) {
                continue;
            }
            startKeyframe.vmft_xmas_processed = 1;

            // the number of lights can be configured in a couple different ways
            const numLights = startKeyframe.vmft_xmas_numlights !== undefined
                ? +startKeyframe.vmft_xmas_numlights
                : config.getNumLights(startKeyframe, endKeyframe);

            // the way we get the entity to insert can also vary a bit
            const getLightEntity = startKeyframe.vmft_xmas_entity
                ? pos => entities.getByTargetname(json, startKeyframe.vmft_xmas_entity)
                        .map(ent => entities.clone(ent))
                        .map(ent => {
                            ent.origin = pos.map(v => Math.round(v)).join(" ");
                            delete ent.targetname;
                            return ent;
                        })
                : config.getLightEntity;
            
            const segmentPosses = RopeUtils.getRopeSteps(startKeyframe, endKeyframe);
            const numSegments = segmentPosses.length - 1;
            // add a light at the start keyframe
            const startPos = startKeyframe.origin.split(" ").map(v => +v);
            outpEnts = outpEnts.concat(getLightEntity(startPos, 0, startKeyframe, endKeyframe));

            // then add all the other lights
            for (let j = 0; j < numLights; ++j) {
                // calculate where they should be placed on the rope
                const progress = (j + 1) / (numLights + 1);
                const segmentProgress = (segmentPosses.length - 1) * progress;
                const iStart = Math.min(Math.floor(segmentProgress), segmentPosses.length - 1);
                const iEnd = Math.min(iStart + 1, segmentPosses.length - 1);
                const vStart = new Vector(segmentPosses[iStart][0], segmentPosses[iStart][1], segmentPosses[iStart][2]);
                const vEnd = new Vector(segmentPosses[iEnd][0], segmentPosses[iEnd][1], segmentPosses[iEnd][2]);
                const vDelta = vEnd.subtract(vStart);
                const leftoverProgress = segmentProgress - Math.floor(segmentProgress);
                const vLightPos = vStart.add(vDelta.multiply(leftoverProgress));
                // then insert them
                const ents = getLightEntity([vLightPos.x, vLightPos.y, vLightPos.z], j + 1, startKeyframe, endKeyframe);
                outpEnts = outpEnts.concat(ents);
            }
        }
    });
    entities.insertGroup(json, outpEnts);
}