import './style.css';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls.js';
import {Engine} from './engine.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'; 
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Planet } from './Components/planet.js';

import { loadCoalModel } from './Components/coal.js';
import { loadHydroModel } from './Components/hydro.js';
import { loadNuclearModel } from './Components/nuclear.js';
import { loadSolarModel } from './Components/solar.js';

let mouse = new THREE.Vector2();
// Create a renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#main-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Create a camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

let controls = new ArcballControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 100;
controls.enableZoom = true;
controls.enablePan = false;
controls.minDistance = 14;
controls.maxDistance = 50;

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


const planet = new Planet(new THREE.MeshStandardMaterial({
    color: 0x60b52f5e9c41,
    roughness: 1,
    flatShading: true
}));
planet.generate();
scene.add(planet.mesh);

planet.mesh.traverse((child) => {
    if (child.isMesh) {
        child.name = 'planet';
    }
});

const coal = (await loadCoalModel(scene)).children[0];
const hydro = (await loadHydroModel(scene)).children[0];
const nuclear = (await loadNuclearModel(scene)).children[0];
const solar = (await loadSolarModel(scene)).children[0];


let sg = new THREE.BoxGeometry(1, 1, 1);
let mat = new THREE.MeshStandardMaterial({color: 'hotpink'});
const boqs = new THREE.Mesh(sg, mat)

// wut it no werk ;( eh its in middle 
const ocean = new THREE.IcosahedronGeometry(10, 3);
const oceanMaterial = new THREE.MeshStandardMaterial({
    color: 0x445ed4,
    flatShading: true,
    transparent: true,
    opacity: .9
});
const oceanMesh = new THREE.Mesh(ocean, oceanMaterial);
oceanMesh.receiveShadow = true;
scene.add(oceanMesh);
oceanMesh.name = 'ocean';

const cursor = {
    light: new THREE.PointLight(0xffffff, 6),
    raycaster: new THREE.Raycaster(),
    pressed: false,
    update() {

        this.raycaster.setFromCamera(mouse, camera);
        const intersects = this.raycaster.intersectObject(planet.mesh);
        if (intersects.length === 0) {
            cursor.light.position.set(NaN, NaN, NaN);
        }
        if (intersects.length > 0) {
            const intersect = intersects[0];
            cursor.light.position
                .copy(intersect.point)
                .setLength(5 + cursor.light.position.length());
        
            //testing
            if (this.pressed)
            {
                this.pressed = false;
            }
        }
    }
}
scene.add(cursor.light);

addEventListener('mousedown', onMouseDown);

let listObj = [];
function onMouseDown(e) { // no way
    cursor.pressed = true;
    
    cursor.raycaster.setFromCamera(mouse, camera);
    const intersects = cursor.raycaster.intersectObject(planet.mesh);
    
    if (intersects.length === 0) return;

    const intersect = intersects[0];
    const position = intersect.point;
    const normal = intersect.face.normal.clone();


    if (position.length() < ocean.parameters.radius) return;
    // sobbing rn why is the coal plamt so small
    

    listObj.push(placeObject(coal, position, normal));
}
function placeObject(obj, pos, norm) {
    // ok yeah mb do rotate it here
    const clone = SkeletonUtils.clone(obj);
    clone.scale.set(0.075,0.075,0.075);
    clone.position.copy(pos);
    clone.rotateX(Math.PI / 2);
    clone.lookAt(pos.clone().add(norm));
    scene.add(clone);
    return clone;
}

const Update = () => {
    controls.update();
    sun.update(engine.delta);
    cursor.update();
}

const Render = () => {
    composer.render();
}

export const engine = new Engine(30, Update, Render);

engine.start();






// const noises = {
//     noiseF: 0.015,
//     noiseD: 15,
//     noiseWater: 0.4,
//     noiseWaterLevel:0.2
// }

// genEarth();

// function genEarth(){
    
//     const time = Date.now()*0.001;
//     const noisesArray = []; auto reload? auto reload? auto reload? auto reload? auto reload? auto reload? auto reload? auto reload? autoreload?
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
