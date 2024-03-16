import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
export async function loadCoalModel(scene) {
    return new Promise((resolve, reject) => {
        let loader = new GLTFLoader();
        let mixer;
        let action;

        loader.load(
            '/Components/3d/coalv2.glb',
            gltf => {
                const coal = gltf.scene;
                coal.scale.set(0.05, 0.05, 0.05);
                coal.position.set(0, 0, 0);

                coal.name = "coal";
                scene.add(coal);
                resolve(coal);
            },
            () => {},
            err => reject(err)
        );
    });
}
// do  'p