/**
 * @param {Vector} p1
 * @param {Vector} p2
 * @param {Vector} p3
 * @param {Vector} p4
 * @param {number} t How far along the spline we should return a point
 */
module.exports = function catmullRom(p1, p2, p3, p4, t) {
    // https://github.com/ra1N1336/IkarosCSSv34/blob/5fdd62195a59d2c3ca3aacc06cdd42eb9836bdc8/public/mathlib.cpp#L3789-L3842
    const tSqr = t * t * 0.5;
    const tSqrSqr = t * tSqr;
    t *= 0.5;
  
    // row 1
    let output = p1.multiply(-tSqrSqr)
        .add(p2.multiply(tSqrSqr * 3))
        .add(p3.multiply(tSqrSqr * -3))
        .add(p4.multiply(tSqrSqr));
    
    // row 2
    output = output
        .add(p1.multiply(tSqr * 2))
        .add(p2.multiply(tSqr * -5))
        .add(p3.multiply(tSqr * 4))
        .add(p4.multiply(-tSqr));
    
    // row 3
    output = output
        .add(p1.multiply(-t))
        .add(p3.multiply(t));
    
    // row 4
    output = output
        .add(p2);
    
    return output;
};