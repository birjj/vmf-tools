// @ts-check
/**
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */
module.exports = class Vector {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
  
    /**
     * @return {number}
     */
    length() {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }
  
    /**
     * @param {Vector} otherVector
     * @return {Vector}
     */
    add(otherVector) {
        return new Vector(
            this.x + otherVector.x,
            this.y + otherVector.y,
            this.z + otherVector.z
        );
    }
  
    /**
     * @param {Vector} otherVector
     * @return {Vector}
     */
    subtract(otherVector) {
        return new Vector(
            this.x - otherVector.x,
            this.y - otherVector.y,
            this.z - otherVector.z
        );
    }
  
    /**
     * @param {number} scalar
     * @return {Vector}
     */
    multiply(scalar) {
        return new Vector(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        );
    }
};