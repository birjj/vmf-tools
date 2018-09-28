// @ts-check
const search = require("./entities");
const Vector = require("./vector");
const RopeSimulation = require("./physics/rope_physics");

module.exports = {
    /**
     * Get every keyframe_rope that a rope goes through
     * @param {object} json The JSON representation of the map
     * @param {object} start The move_rope entity the rope starts from
     * @returns {object[]} The entities the rope goes through, including `start`
     */
    getRopeKeyframes(json, start) {
        const outp = [];
        let currentEntity = start;
        while (currentEntity) {
            outp.push(currentEntity);
            currentEntity = currentEntity.NextKey
                ? search.getByTargetname(json, currentEntity.NextKey)[0]
                : null;
            if (outp.indexOf(currentEntity) !== -1) { break; }
        }
        return outp;
    },

    /**
     * Gets the location for each step of a rope
     * @param {object} start The entity the rope starts from - move_rope or keyframe_rope
     * @param {object} end The entity the rope ends at - keyframe_rope
     * @returns {number[][]} Coordinates for each of the steps, in format [x,y,z]
     */
    getRopeSteps(start, end) {
        const originToVector = origin => {
            const parsed = origin.split(" ").map(v => +v);
            return new Vector(parsed[0], parsed[1], parsed[2]);
        };
        const sim = new RopeSimulation(
            originToVector(start.origin),
            originToVector(end.origin),
            +start.Slack
        );
        sim.simulate(3);
        return sim.getSegments(+start.Subdiv).map(
            node => [node.x, node.y, node.z]
        );
    },
};