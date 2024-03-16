import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
export async function loadSolarModel(scene) {
    return new Promise((resolve, reject) => {
        let loader = new GLTFLoader();
        let mixer;
        let action;

        loader.load(
            '/Components/3d/solar.glb',
            function(gltf){
                let coal = gltf.scene;
                coal.scale.set(0.05, 0.05, 0.05);
                coal.position.set(0, 0, 0);

                // mixer = new THREE.AnimationMixer(gltf.scene);
                // const clips = gltf.animations; 
                // const clip = clips[0];
                // action = mixer.clipAction(clip);
                // action.reset();
                // action.play();

                coal.name = "solar"
                scene.add(coal);
                resolve(coal);  // Resolve the promise with coal       
            },
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ), '% loaded' );
            },
            function ( error ) {
                console.log(error);
                console.log( 'An error happened' );
                reject(error); // Reject the promise with error
            }
        );
    });
}
// do  'p