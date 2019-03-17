# Christmas Lights

This adds entities along ropes in the map (by default colourful glowing sprites, thus the name "christmas lights").

![](docs/imgs/christmas_lights.png)

## Configuration

In short: add `vmft_xmas 1` to the ropes you want to put entities on.

You can configure which ropes are processed, how many entities are added to each rope, and which entities are placed. The default is one for every 32 inches the `keyframe_rope`'s are apart and an `env_sprite` of different colors.

These be configured in Hammer by setting custom keyvalues on the `keyframe_rope`'s. The following keyvalues are recognized:

<dl>
<dt><code>vmft_xmas</code></dt><dd>If set to <code>1</code>, process the rope. If set to <code>0</code>, don't process the rope even if it would have been otherwise</dd>
<dt><code>vmft_xmas_numlights</code></dt><dd>If set to a number, the number of lights to add - overrides <code>getNumLights()</code></dd>
<dt><code>vmft_xmas_entity</code></dt><dd>If set, the name of the entity to add as lights - overrides <code>getLightEntity()</code>. The entity has its origin set to the light position, and has its <code>targetname</code> removed</dd>
</dl>

They can also be configured in the config file:

```js
{
    rules: {
        christmas_lights: {
            /** Gets whether we should process the rope */
            shouldAddLights(startKeyframe, endKeyframe) {
                // both keyframes are JS objects containing the entity's keyvalues

                // default: only if startKeyframe has `vmft_christmas` set to `1`
            }

            /** Gets the number of lights we should add to a rope */
            getNumLights(startKeyframe, endKeyframe) {
                // both keyframes are JS objects containing the entity's keyvalues

                // default: dist(startKeyframe -> endKeyframe) / 32
            },

            /** Gets the entity we should insert at a given position */
            getLightEntity(pos, i, start, end) {
                // pos is an array of format [x, y, z]
                // i is which number of light we are on the current rope
                // start/end are same entities as in getNumLights

                // default: env_sprite with a bright color
            }
        }
    }
}
```