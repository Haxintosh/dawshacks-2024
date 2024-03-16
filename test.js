import * as THREE from 'three';
// import {geome/} 
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { randFloat } from 'three/src/math/MathUtils';
import { randFloatSpread } from 'three/src/math/MathUtils';

const noises = {
    noiseF: 0.015,
    noiseD: 15,
    noiseWater: 0.4,
    noiseWaterLevel:0.2
}

const time = Date.now()*0.001;
const noisesArray = [];
function noise(v, f, i) {
    const nv = new THREE.Vector3(v.x, v.y, v.z).multiplyScalar(f).addScalar(time);
    let noice = (new SimplexNoise().noise3d(nv.x, nv.y, nv.z) + 1) / 2;
    noice = (noice > noises.noiseWater) ? noice : noises.noiseWaterLevel;
    if (Number.isInteger(i)) noisesArray[i] = noice;
    return noice;
}

const dispV = (v, i) => {
    const dv = new Vector3(v.x, v.y, v.z);
    dv.add(dv.clone().normalize().multiplyScalar(noise(dv, noises.noiseF, i) * noises.noiseD));
    v.x = dv.x; v.y = dv.y; v.z = dv.z;
};

// globe geo
const geometry = new THREE.BufferGeometry().fromGeometry(new THREE.IcosahedronGeometry(radius, detail));
geometry.mergeVertices();

for (let i = 0; i < geometry.vertices.length; i++) dispV(geometry.vertices[i], i);
geometry.computeFlatVertexNormals();

let groundColor = 0x00ff00;
let waterColor = 0x0000ff;

for (let i = 0; i < geometry.faces.length; i++) {
    const f = geometry.faces[i];
    f.color.set(groundColor);
    if (noisesArray[f.a] === noises.noiseWaterLevel && noisesArray[f.b] === noises.noiseWaterLevel && noisesArray[f.c] === noises.noiseWaterLevel) {
      f.color.set(waterColor);
    }
}

const material = new THREE.MeshPhongMaterial({ shininess: 30, flatShading: true, vertexColors: VertexColors} );
const mesh = new THREE.Mesh(geometry.toBufferGeometry(), material);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);