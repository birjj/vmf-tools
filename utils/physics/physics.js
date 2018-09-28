// @ts-check
const TIME_STEP = 1 / 50;
const DAMPENING = 0.98;
const ACCEL_MULT = TIME_STEP * TIME_STEP * 0.5;

/** @typedef {import("../vector.js")} Vector */
/**
 * @typedef PhysicsNode
 * @property {Vector} pos
 * @property {Vector} prevPos
 * @property {() => Vector} getForces
 */
/**
 * @typedef Delegator
 * @property {(nodes: PhysicsNode[]) => any} applyConstraints
 */

module.exports = class Simulation {
    /** @param {Delegator} delegator */
    constructor(delegator) {
        /** @type {PhysicsNode[]} */
        this.nodes = [];
        this.delegator = delegator;

        this.frame = 0;
    }

    addNode(node) {
        this.nodes.push(node);
    }

    simulate(nSteps) {
        // https://github.com/ra1N1336/IkarosCSSv34/blob/5fdd62195a59d2c3ca3aacc06cdd42eb9836bdc8/public/simple_physics.cpp#L30-L70
        const numSimulations = nSteps / TIME_STEP;
        for (let i = 0; i < numSimulations; ++i) {
            ++this.frame;
            // simulate all nodes
            this.nodes.forEach(node => {
                const prevPos = node.prevPos;
                const accel = node.getForces();
                const vel = node.pos.subtract(node.prevPos).multiply(DAMPENING);
                node.pos = node.pos.add(vel).add(accel.multiply(ACCEL_MULT));
                node.prevPos = prevPos;
            });
            this.delegator.applyConstraints(this.nodes);
        }
    }
};