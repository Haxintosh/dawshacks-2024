import './style.css';
import * as THREE from 'three';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls.js';
import {Engine} from './engine.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'; 
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {Planet} from './planet.js';

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
// Create a renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#main-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

let controls = new ArcballControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 100;
controls.enableZoom = true;
controls.enablePan = false;
// controls.minDistance = 1.5;
// controls.maxDistance = 5;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFAC898);

// Composer
const composer = new EffectComposer(renderer);
composer.setSize(innerWidth, innerHeight);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(outlinePass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, .2));
const sun = {
    directionalLight: new THREE.DirectionalLight(0xffffff, 1),
    backLight: new THREE.DirectionalLight(0x8888ff, .2),
    body: new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 1),
        new THREE.MeshBasicMaterial({
            color: 0xffcc88
        })),
    axis: new THREE.Vector3(1, 2, 3).normalize(),
    speed: .1, // rad / s
    update(dt) {
        this.directionalLight.position.applyAxisAngle(
            this.axis, this.speed * dt / 1000);
        this.backLight.position.copy(this.directionalLight.position)
            .multiplyScalar(-1);
        this.body.position.copy(this.directionalLight.position.clone().multiplyScalar(this.radius));
    }
};
sun.directionalLight.position
    .copy(new THREE.Vector3(1, 0, 0)
        .cross(sun.axis).normalize());
scene.add(sun.directionalLight);
scene.add(sun.backLight);

// // The planet
// scene.add(new THREE.Mesh(
//     (() => {
//         const geometry = new THREE.IcosahedronGeometry(1, 10);
//         console.log(geometry)
//         return geometry;
//     }),
//     new THREE.MeshStandardMaterial({
//         color: 0x00ff00,
//         flatShading: true
//     })
// ));

// Additional lights


const Update = () => {
    controls.update();
    sun.update(engine.delta);
    raycastHandler();
}

const Render = () => {
    // renderer.render(scene, camera);
    composer.render();
}

export const engine = new Engine(30, Update, Render);

engine.start();

// Canvas resize
window.addEventListener('resize', () => {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});


function onPointerMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

addEventListener('mousemove', onPointerMove);

function raycastHandler(){
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects( scene.children, true);
};


const planet = new Planet();
planet.generate();

//Water
const wGeo = new THREE.IcosahedronGeometry(5, 3);
const blue = new THREE.MeshStandardMaterial({ color: 0x0000ff, flatShading: true });
const wMesh = new THREE.Mesh(wGeo, blue);
wMesh.receiveShadow = true;
scene.add(wMesh);
scene.add(planet.mesh);

// const noises = {
//     noiseF: 0.015,
//     noiseD: 15,
//     noiseWater: 0.4,
//     noiseWaterLevel:0.2
// }

// genEarth();

// function genEarth(){
    
//     const time = Date.now()*0.001;
//     const noisesArray = [];
//     function noise(v, f, i) {
//         const nv = new THREE.Vector3(v.x, v.y, v.z).multiplyScalar(f).addScalar(time);
//         let noice = (new SimplexNoise().noise3d(nv.x, nv.y, nv.z) + 1) / 2;
//         noice = (noice > noises.noiseWater) ? noice : noises.noiseWaterLevel;
//         if (Number.isInteger(i)) noisesArray[i] = noice;
//         return noice;
//     }

//     const dispV = (v, i) => {
//         const dv = new Vector3(v.x, v.y, v.z);
//         dv.add(dv.clone().normalize().multiplyScalar(noise(dv, noises.noiseF, i) * noises.noiseD));
//         v.x = dv.x; v.y = dv.y; v.z = dv.z;
//     };

//     // globe geo
//     const geometry = new THREE.BufferGeometry().fromGeometry(new THREE.IcosahedronGeometry(radius, detail));
//     geometry.mergeVertices();

//     for (let i = 0; i < geometry.vertices.length; i++) dispV(geometry.vertices[i], i);
//     geometry.computeFlatVertexNormals();

//     let groundColor = 0x00ff00;
//     let waterColor = 0x0000ff;

//     for (let i = 0; i < geometry.faces.length; i++) {
//         const f = geometry.faces[i];
//         f.color.set(groundColor);
//         if (noisesArray[f.a] === noises.noiseWaterLevel && noisesArray[f.b] === noises.noiseWaterLevel && noisesArray[f.c] === noises.noiseWaterLevel) {
//         f.color.set(waterColor);
//         }
//     }

//     const material = new THREE.MeshPhongMaterial({ shininess: 30, flatShading: true, vertexColors: VertexColors} );
//     const mesh = new THREE.Mesh(geometry.toBufferGeometry(), material);
//     mesh.castShadow = true;
//     mesh.receiveShadow = true;
//     scene.add(mesh);
// }
