import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise.js';
import {engine} from '../main.js'

export class Planet {
    constructor()
    {
        this.simplex = new SimplexNoise();

        this.geometry = {};
        this.nPos = [];
        this.vertices = {};

        this.material = {};
        this.mesh = {};

    }

    displace()
    {
        this.geometry.userData.nPos.forEach((p, idx) => {
            const noise = this.simplex.noise3d(p.x, p.y, p.z); //y is it worse bro, its not loading
            const v = p.clone().multiplyScalar(10).addScaledVector(p, noise);
            this.vertices.setXYZ(idx, v.x, v.y, v.z);
        });
    }

    generate()
    {
        //Geometry
        console.log('generating');
        this.geometry = new THREE.IcosahedronGeometry(10, 10);

        this.vertices = this.geometry.attributes.position;
        this.uv = this.geometry.attributes.uv;
        this.v3 = new THREE.Vector3();

        for (let i = 0; i < this.vertices.count; i++){
            this.v3.fromBufferAttribute(this.vertices, i).normalize();
            this.nPos.push(this.v3.clone());
        }
        this.geometry.userData.nPos = this.nPos;
        // displac
        for (let i = 0; i < this.vertices.count; i++) this.displace(new THREE.Vector3().fromBufferAttribute(this.vertices, i).normalize(), i);
        this.geometry.computeVertexNormals();


        // Mesh
        this.green = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true });
        this.mesh = new THREE.Mesh(this.geometry, this.green);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        console.log('generated');
    }
    //its not rendering shit
}