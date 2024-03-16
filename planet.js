import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise.js';
import {engine} from './main.js'

export class Planet {
    constructor()
    {
        this.simplex = new SimplexNoise();
        this.noises = [];

        this.geometry = {};
        this.nPos = [];
        this.vertices = {};

        this.material = {};
        this.mesh = {};

        // generate noise
        this.genNoise = function (v /* Vertices */, force, i /*index*/)
        {
            const nv = new THREE.Vector3(v.x, v.y, v.z).multiplyScalar(force).addScalar(Math.random());
            // Generate noise vector at coordinates
            let noise = (this.simplex.noise3d(nv.x, nv.y, nv.z)+1)/2;
            // the grid of the noise
            this.noises[i] = noise;

            return noise;
        };

        //displace
        this.displace = function(v /* Vertices */, i /*index*/)
        {
            // const dv = new THREE.Vector3(v.x, v.y, v.z);
            // console.log(dv.x)
            // dv.add(dv.clone().normalize().multiplyScalar(this.genNoise(dv, 0.015, i)*15));
            // // Displace the vertice position
            // this.vertices.setX(i, dv.x); this.vertices.setY(i, dv.y); this.vertices.setZ(i, dv.z);

            let t = engine.time;
            this.geometry.userData.nPos.forEach((p, idx) => {
                let ns = this.simplex.noise4d(p.x, p.y, p.z, t);
                this.v3.copy(p).multiplyScalar(2).addScaledVector(p, ns);
                this.vertices.setXYZ(idx, this.v3.x, this.v3.y, this.v3.z);
            });
        };

    }

    generate()
    {
        //Geometry
        this.geometry = new THREE.IcosahedronGeometry(10, 10);// still massive
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
        console.log(this.noises)
        console.log(this.uv.getX(1));


        // Mesh
        this.material = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        // return this.mesh;
    }
    //its not rendering shit
}