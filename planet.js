import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise.js';

export class Planet {
    constructor()
    {
        this.simplex = new SimplexNoise();
        this.noises = [];

        this.geometry = {};
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
            this.noises[i] = parseInt(noise);

            return noise;
        };

        //displace
        this.displace = function(v /* Vertices */, i /*index*/)
        {
            const dv = new THREE.Vector3(v.x, v.y, v.z);
            console.log(dv.x)
            dv.add(dv.clone().normalize().multiplyScalar(this.genNoise(dv, 0.015, i)*15));
            // Displace the vertice position
            this.vertices.setX(i, dv.x); this.vertices.setY(i, dv.y); this.vertices.setZ(i, dv.z);
        };

    }

    generate()
    {
        //Geometry
        this.geometry = new THREE.IcosahedronGeometry(10, 10);// still massive
        this.vertices = this.geometry.attributes.position;
        this.uv = this.geometry.attributes.uv;
        // displac
        for (let i = 0; i < this.vertices.count; i++) this.displace(new THREE.Vector3(this.vertices.getX(i), this.vertices.getY(i),this.vertices.getZ(i)), i);
        this.geometry.computeVertexNormals();

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