import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls.js';
import {Engine} from './engine.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'; 
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

import { Planet } from './Components/planet.js';

import { loadCoalModel } from './Components/coal.js';
import { loadHydroModel } from './Components/hydro.js';
import { loadNuclearModel } from './Components/nuclear.js';
import { loadSolarModel } from './Components/solar.js';
import { loadWindModel } from './Components/wind.js';

import * as logic from './logic.js';

let mouse = new THREE.Vector2();
let oneShot = false;
// Create a renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#main-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Create a camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

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

// material config hardcoded in Planet ctor
const planet = new Planet();
planet.generate();
scene.add(planet.mesh);

planet.mesh.traverse((child) => {
    if (child.isMesh) {
        child.name = 'planet';
    }
});

const generators = {
    coal        : (await loadCoalModel(scene)).children[0],
    hydro       : (await loadHydroModel(scene)).children[0],
    nuclear     : (await loadNuclearModel(scene)).children[0],
    solar       : (await loadSolarModel(scene)).children[0],
    wind        : (await loadWindModel(scene)).children[0]
}



const oceanRadius = 10;
const oceanMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(oceanRadius, 3),
    new THREE.MeshStandardMaterial({
        color: 0x445ed4,
        transparent: true,
        opacity: .5,
        roughness: .5
    })
);
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

let structures = [];
let selection = 'hydro';

let prev = {};
addEventListener('mousemove', () => {
    unmoved = false;
    scene.remove(prev);
    if (cursor.pressed)
        return;
    
    cursor.raycaster.setFromCamera(mouse, camera);
    const intersects = cursor.raycaster.intersectObject(planet.mesh);
    
    if (intersects.length === 0) return;

    const intersect = intersects[0];
    const position = intersect.point;
    const normal = intersect.face.normal.clone();


    // if (position.length() < ocean.parameters.radius) return;
    // sobbing rn why is the coal plamt so small
    

    prev = placeObject(generators[selection], position, normal, 0.5);
})

addEventListener('mousedown', () => unmoved = true);
addEventListener('mouseup', onMouseUp);
let unmoved = true;

function onMouseUp(e) { // no way
    if (unmoved)
    {
        cursor.raycaster.setFromCamera(mouse, camera);
        const intersects = cursor.raycaster.intersectObject(planet.mesh);
        
        if (intersects.length === 0) return;

        const intersect = intersects[0];
        const position = intersect.point;
        const normal = intersect.face.normal.clone();

        // logic.energyGenerators.push(new);

        // move this step into Generator interface to  allow oil plants on the sea and stuff
        if (selection === 'coal' || selection === 'nuclear') {
            if (position.length() < oceanRadius) return;
        }
        if (selection === 'hydro') {
            if (position.length() > oceanRadius) return;
        }
        // prevent collision
        for (const structure of structures) {
            if (false ) return;
        }
        
        if (!selection) return; // yes
        structures.push(placeObject(generators[selection], position, normal));
    }
    
}
function placeObject(obj, position, normal, alpha = 1) {
    // ok yeah mb do rotate it here
    const clone = SkeletonUtils.clone(obj);
    
    clone.position.copy(position);
    clone.rotateX(Math.PI / 2);
    clone.lookAt(position.clone().add(normal));


    if (selection === 'wind') {
        logic.energyGenerators.push([new logic.WindGenerator(), clone]);
        clone.scale.set(0.0005, 0.0005, 0.0005);
    } else if (selection === 'solar') {
        logic.energyGenerators.push([new logic.SolarGenerator(), clone]);
        clone.scale.set(0.0075, 0.0075, 0.0075);
    } else if (selection === 'coal') {
        logic.energyGenerators.push([new logic.FossilFuelGenerator(), clone]);
        clone.scale.set(0.075, 0.075, 0.075);
    } else if (selection === 'nuclear') {
        logic.energyGenerators.push([new logic.NuclearGenerator(), clone]);
        clone.scale.set(0.0075, 0.0075, 0.0075);
    } else if (selection === 'hydro') {
        logic.energyGenerators.push([new logic.HydroGenerator(), clone]);
        clone.scale.set(0.05, 0.05, 0.05);
    }

    // structures.push(placeObject(generators[selection], position, normal)); // 💀💀

    scene.add(clone);
    return clone;
}

let msPerCycle = 1000;
let statistics;

// whats ms per cycle though milisecond per cycle of game, every cycle month i++

let oldTime = performance.now();
const Update = () => {
    controls.update();
    sun.update(engine.delta); // sus.update
    cursor.update();
    
    let delta = performance.now() - oldTime;
    if (delta < msPerCycle) return;
    oldTime = performance.now();

    statistics = logic.calculate();
}

const Render = () => {
    composer.render();
}

export const engine = new Engine(30, Update, Render);

engine.start();









// U-Eey
let statButton = document.getElementById('rsc-btn');
let buildButton = document.getElementById('iftr-btn');

statButton.addEventListener('click', statsHandler);
buildButton.addEventListener('click', buildHandler);

var uiStatus=0
document.addEventListener('keydown', function(event){
    if(event.keyCode==9){
        event.preventDefault();
        uiToggle();
    }
});

function uiToggle(){
    if(uiStatus==0){
        document.getElementById('ui-obj').style.opacity='0';
        document.getElementById('ui-obj').style.height='0px';
        document.getElementById('ui-side-bar').style.opacity='0';
        document.getElementById('ui-side-bar').style.height='0px';
        document.getElementById('iftr-btn').style.transform='translate(-50%,-30%) scaleY(0)';
        document.getElementById('rsc-btn').style.transform='translate(-50%,-30%) scaleY(0)';
        uiStatus=1;
    }
    else{
        document.getElementById('ui-obj').style.opacity='1';
        document.getElementById('ui-obj').style.height='30vh';
        document.getElementById('ui-side-bar').style.opacity='1';
        document.getElementById('ui-side-bar').style.height='96.5vh';
        document.getElementById('iftr-btn').style.transform='translate(-50%,-50%) scaleY(1)';
        document.getElementById('rsc-btn').style.transform='translate(-50%,-50%) scaleY(1)';
        uiStatus=0;
    }
}

function statsHandler(){
    
}

function buildHandler(){
    const statBox = document.getElementById('stat-box');
    statBox.style.display='none';
    const buildBox = document.getElementById('build-box');
    buildBox.style.display='block';
    
}

document.getElementById('wind-pl-box').addEventListener('click', () => {
    selection = 'wind';
});

document.getElementById('solar-pl-box').addEventListener('click', () => {
    selection = 'solar';
});

document.getElementById('hydro-pl-box').addEventListener('click', () => {
    selection = 'hydro';
});

document.getElementById('nuclear-pl-box').addEventListener('click', () => {
    selection = 'nuclear';
});

document.getElementById('coal-pl-box').addEventListener('click', () => {
    selection = 'coal';
});
