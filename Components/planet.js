import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise.js';
import {engine} from '../main.js'

export class Planet {
    constructor(material)
    {
        this.simplex = new SimplexNoise();

        this.geometry = {};
        this.nPos = [];
        this.vertices = {};

        this.material = material;
        this.mesh = {};
    }

    displace()
    {
        this.geometry.userData.nPos.forEach((p, idx) => {
            const noise = this.simplex.noise3d(p.x, p.y, p.z);
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

        for (let i = 0; i < this.vertices.count; i++){
            const v = new THREE.Vector3()
                .fromBufferAttribute(this.vertices, i).normalize();
            this.nPos.push(v);
        }
        this.geometry.userData.nPos = this.nPos;
        // displac
        for (let i = 0; i < this.vertices.count; i++) this.displace(new THREE.Vector3().fromBufferAttribute(this.vertices, i).normalize(), i);
        this.geometry.computeVertexNormals();


        // Mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        console.log('generated');
    }
    //its not rendering shit
}