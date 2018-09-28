const Simulation = require("./physics");
const Vector = require("../vector");
const catmullRom = require("./catmull_rom");

const GRAV_VECTOR = new Vector(0, 0, -1500);
const NULL_VECTOR = new Vector(0, 0, 0);
const NUM_SEGMENTS = 9;
const FUDGE_FACTOR = -100;

module.exports = class RopePhysics {
    /**
     * @param {Vector} start
     * @param {Vector} end
     * @param {number} slack
     */
    constructor(start, end, slack) {
        this.start = start;
        this.end = end;
        this.slack = slack;
        this.simulation = new Simulation(this);
        this.springLength = 1;

        // generate each segment
        this.generateStart();
        this.resizeSprings();
    }

    /**
     * Returns the segments making up the smoothed out rope
     * @param {number} numSubdivs The number of subdivisions
     * @returns {Vector[]} The segment points
     */
    getSegments(numSubdivs) {
        const outp = [];
        let iPrev = 0;
        const iLast = this.simulation.nodes.length - 1;
        for (let i = 0; i < this.simulation.nodes.length; ++i) {
            // make sure the start is added
            const node = this.simulation.nodes[i];
            outp.push(node.pos);

            // if we are not the last node, subdivide ahead
            if (i < iLast) {
                const iNext = Math.min(i + 1, iLast);
                const iNextNext = Math.min(i + 2, iLast);

                for (let j = 0; j < numSubdivs; ++j) {
                const segment = catmullRom(
                    this.simulation.nodes[iPrev].pos,
                    this.simulation.nodes[i].pos,
                    this.simulation.nodes[iNext].pos,
                    this.simulation.nodes[iNextNext].pos,
                    (j + 1) / (numSubdivs + 1)
                );
                outp.push(segment);
                }
                iPrev = i;
            }
        }
        return outp;
    }

    resizeSprings() {
        this.springLength = (
            this.start.subtract(this.end).length() - 5 // TODO: figure out where extra length comes from instead
                + this.slack
                + FUDGE_FACTOR
        ) / (this.simulation.nodes.length - 1)
    }

    applyConstraints(nodes) {
        // https://github.com/ra1N1336/IkarosCSSv34/blob/5fdd62195a59d2c3ca3aacc06cdd42eb9836bdc8/public/rope_physics.cpp#L111-L150
        // iterate multiple times 'cause Valve claim it's needed
        for (let i = 0; i < 3; ++i) {
            for (let j = 1; j < nodes.length; ++j) {
                const node = nodes[j];
                const prev = nodes[j - 1];

                const vTo = new Vector(
                node.pos.x - prev.pos.x,
                node.pos.y - prev.pos.y,
                node.pos.z - prev.pos.z,
                );
                const actual = vTo.length();
                const expected = this.springLength;
                if (actual > expected) {
                const rescaler = vTo.multiply(1 - (expected / actual)).multiply(0.5);
                node.pos = node.pos.subtract(rescaler);
                node.prevPos = node.pos;
                prev.pos = prev.pos.add(rescaler);
                prev.prevPos = prev.pos;
                }
            }

            // lock start and end (Valve do this differently, but that takes a while to implement)
            // https://github.com/ra1N1336/IkarosCSSv34/blob/5fdd62195a59d2c3ca3aacc06cdd42eb9836bdc8/public/cl_dll/c_rope.cpp#L492-L518
            nodes[0].pos = this.start;
            nodes[nodes.length - 1].pos = this.end;
        }
    }

    generateStart() {
        // https://github.com/ra1N1336/IkarosCSSv34/blob/5fdd62195a59d2c3ca3aacc06cdd42eb9836bdc8/public/game_shared/rope_helpers.cpp#L87-L138
        const startToEnd = this.end.subtract(this.start);
        for (let i = 0; i <= NUM_SEGMENTS; ++i) {
            const node = {
                pos: this.start.add(startToEnd.multiply(i / NUM_SEGMENTS)),
                /** @type { Vector } */
                prevPos: null,
                getForces: i === 0 || i === NUM_SEGMENTS
                ? () => NULL_VECTOR
                : () => GRAV_VECTOR,
            };
            node.prevPos = node.pos;
            this.simulation.addNode(node);
        }
    }

    simulate(...args) { this.simulation.simulate(...args); }
}