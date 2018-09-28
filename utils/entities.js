// @ts-check

/**
 * Walks through every object in a JSON object
 * @param {object} json The JSON object to walk through
 * @param {(obj: object) => any} callback Called with every non-primitive in the JSON
 */
function jsonWalk(json, callback, seen = []) {
    const keys = Object.keys(json);
    keys.forEach(key => {
        const val = json[key];
        if (val instanceof Object) {
            callback(val);
            if (seen.indexOf(val) === -1) {
                seen.push(val);
                jsonWalk(val, callback, seen);
            }
        }
    });
}

module.exports = {
    /**
     * Get a unique ID that isn't used by any other entry in the map
     * @param {object} json The JSON representation of the map
     * @return {number} The unique ID
     */
    getUniqueID(json) {
        const existingIDs = [];
        jsonWalk(json, obj => {
            if (obj.id !== undefined) {
                existingIDs.push(obj.id);
            }
            if (obj.groupid !== undefined) {
                existingIDs.push(obj.groupid);
            }
        });

        // find an ID that isn't already in the VMF
        let i = 0;
        while (true) {
            ++i;
            if (existingIDs.indexOf(i + "") === -1) {
                return i;
            }
        }
    },

    /**
     * Inserts an entity into the map
     * @param {object} json The JSON representation of the map
     * @param {object} entity The entity to insert
     */
    insert(json, entity) {
        json.entity = json.entity || [];
        json.entity.push(entity);
    },

    /**
     * Inserts some entities into the map as a group
     * @param {object} json The JSON representation of the map
     * @param {object[]} entities The entities to insert
     */
    insertGroup(json, entities) {
        const groupid = module.exports.getUniqueID(json);
        entities.forEach(ent => {
            ent.editor = ent.editor || {};
            ent.editor.groupid = ""+groupid;
            module.exports.insert(json, ent);
        });
    },

    /**
     * Get all entities in a map that have a specific key-value pair
     * @param {object} json The JSON representation of the map
     * @param {string} key The key to check
     * @param {string} value The value to check
     * @return {object[]} The entities
     */
    getByKeyValue(json, key, value) {
        return (json.entity || []).filter(
            entity => entity[key] === value
        );
    },

    /**
     * Get all entities in a map that are instances of a specific classname
     * @param {object} json The JSON representation of the map
     * @param {string} classname The classname to get
     * @return {object[]} The entities
     */
    getByClassname(json, classname) {
        return module.exports.getByKeyValue(json, "classname", classname);
    },

    /**
     * Get all entities in a map that have a specific targetname
     * @param {object} json The JSON representation of the map
     * @param {string} targetname The targetname to get
     * @return {object[]} The entities
     */
    getByTargetname(json, targetname) {
        return module.exports.getByKeyValue(json, "targetname", targetname);
    },

    /**
     * Deep clones an entity
     * Remember to update its ID when you insert it
     * @param {object} ent The entitity to clone
     * @return {object} The cloned entity
     */
    clone(ent) {
        const outp = Object.assign({}, ent);
        outp.editor = Object.assign({}, ent.editor);
        return outp;
    }
};