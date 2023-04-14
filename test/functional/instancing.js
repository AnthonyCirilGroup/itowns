const assert = require('assert');

describe('instancing', function _() {
    let result;
    before(async () => {
        result = await loadExample(
            'examples/territoire3D.html',
            this.fullTitle(),
        );
    });

    it('should run', async () => {
        assert.ok(result);
    });

    it('should load the trees and lights objects', async () => {
        /*  const objects = await page.evaluate(
            () => {
                if (view.scene) {
                    const objects3d = view.scene.children;
                    if (objects3d) {
                        // return objects3d.filter(o => o.isGroup).map(p => p.name);
                        return objects3d.map(p => p.name);
                    }
                }
                return [];
            });

        assert.ok(objects.indexOf('lights') >= 0);
        assert.ok(objects.indexOf('trees') >= 0); */

        page.on('console', async (msg) => {
            const msgArgs = msg.args();
            for (let i = 0; i < msgArgs.length; ++i) {
                console.log(await msgArgs[i].jsonValue());
            }
        });

        const objects = await page.evaluate(
            () => {
                const res = [];
                if (view.scene) {
                    const objects3d = view.scene;
                    objects3d.traverse((obj) => {
                        if (obj.isInstancedMesh) {
                            // debugger;
                            if (obj.parent && obj.parent.layer) {
                                res.push(obj.parent.layer.name);
                            }
                        }
                    });
                }
                return res;
            });
        assert.ok(objects.indexOf('lights') >= 0);

        assert.ok(objects.indexOf('trees') >= 0);

        /*
        // Trees
        const trees = await page.evaluate(
            () => {
                const instanced = view.pickObjectsAt({
                    x: 166,
                    y: 195,
                })
                    .filter(o => o.object.isInstancedMesh);
                if (instanced) {
                    return instanced.map(p => p.layer.name);
                }
                return [];
            });
        assert.ok(trees.indexOf('trees') >= 0);

        // Lights
        const lights = await page.evaluate(
            () => {
                const instanced = view.pickObjectsAt({
                    x: 225,
                    y: 149,
                })
                    .filter(o => o.object.isInstancedMesh);
                if (instanced) {
                    return instanced.map(p => p.layer.name);
                }
                return [];
            });

        assert.ok(lights.indexOf('lights') >= 0); */
    });
});
