/* global XRRigidTransform */

import * as THREE from 'three';
import { VRButton } from 'ThreeExtended/webxr/VRButton';

async function shutdownXR(session) {
    if (session) {
        await session.end();
    }
}

const initializeWebXR = (view, options) => {
    document.body.appendChild(VRButton.createButton(view.mainLoop.gfxEngine.renderer));
    const xr = view.mainLoop.gfxEngine.renderer.xr;
    const scale = options.scale || 1.0;

    xr.addEventListener('sessionstart', () => {
        console.log('Web XR session start'); // eslint-disable-line

        const camera = view.camera.camera3D;
        const webXRManager = view.mainLoop.gfxEngine.renderer.xr;

        const exitXRSession =  (event) => {
            if (event.key === 'Escape') {
                console.log('Web XR session stop'); // eslint-disable-line
                document.removeEventListener('keydown', exitXRSession);
                view.mainLoop.gfxEngine.renderer.xr.enabled = false;
                view.camera.camera3D = camera;

                view.scene.scale.multiplyScalar(1 / scale);
                view.scene.updateMatrixWorld();

                shutdownXR(webXRManager.getSession());
                view.notifyChange(view.camera.camera3D, true);
            }
        };
        view.scene.scale.multiplyScalar(scale);
        view.scene.updateMatrixWorld();
        view.mainLoop.gfxEngine.renderer.xr.enabled = true;
        view.mainLoop.gfxEngine.renderer.xr.getReferenceSpace('local');

        const position = view.camera.position();
        const geodesicNormal = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.geodesicNormal).invert();

        const quat = new THREE.Quaternion(-1, 0, 0, 1).normalize().multiply(geodesicNormal);
        const trans = camera.position.clone().multiplyScalar(-scale).applyQuaternion(quat);
        const transform = new XRRigidTransform(trans, quat);

        const baseReferenceSpace = xr.getReferenceSpace();
        const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);
        xr.setReferenceSpace(teleportSpaceOffset);

        view.camera.camera3D = view.mainLoop.gfxEngine.renderer.xr.getCamera();
        view.camera.resize(view.camera.width, view.camera.height);

        document.addEventListener('keydown', exitXRSession, false);

        webXRManager.setAnimationLoop((timestamp) => {
            if (xr.isPresenting && view.camera.camera3D.cameras[0]) {
                view.camera.camera3D.updateMatrix();
                view.camera.camera3D.updateMatrixWorld(true);
                view.notifyChange(view.camera.camera3D, true);
            }

            view.mainLoop.step(view, timestamp);
        });
    });
};

export default initializeWebXR;


