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
        
        this.grassColor = new THREE.Color(0x60b52f),
        this.sandColor = new THREE.Color(0xd9cb98),
        this.material = new THREE.MeshStandardMaterial({
            vertexColors: false,
            color: this.grassColor,
            opacity: .5,
            roughness: .5,
        });
        this.mesh = {};
    }

    displace()
    {
        // generate terrain and colors
        for (let i = 0; i < this.vertices.count; i++) {
            
            const p = new THREE.Vector3()
                .fromBufferAttribute(this.vertices, i);

            const scale = .1;
            const minHeight = -.5;
            const maxHeight = .5;
            let height = this.simplex.noise3d(
                scale * p.x, scale * p.y, scale * p.z);
                height *= 2;
                height = Math.max(minHeight, Math.min(maxHeight, height));
            p.setLength(p.length() + height);
            this.vertices.setXYZ(i, p.x, p.y, p.z);
                

            // globe geometry - faces colors
            // for (let i = 0; i < geometry.faces.length; i++) {
                
            //     }
            // }
            // we're doing something wrong
            // //how tf do we get the faces
            // const c = new THREE.Color(Math.random() * 0xff0000);
            //     console.log(c)
            //     // imma head to dawson bye
            //     // see this doesnt work either
            // // this.colors.setXYZ(i, c.r*255, c.g, c.b);
            // this.colors.needsUpdate = true;
        }
        //see https://github.com/mrdoob/three.js/blob/dev/examples/webgl_geometry_colors.html
    }; 

    generate()
    {
        //Geometry
        console.log('generating');
        this.geometry = new THREE.IcosahedronGeometry(10, 10);
        // console.log(this.geometry);
        // let colors = [];
        // for (let i = 0; i < this.vertices.count; i++) {

        //     colors.push(1, 1, 1); // add for each vertex color data
        
        // }
        // let colorAttr = new THREE.Float32BufferAttribute(colors, 3);
        // this.geometry.setAttribute('color', colorAttr);

        this.vertices = this.geometry.attributes.position;
        // this.colors = this.geometry.attributes.color;

        // for (let i = 0; i < this.vertices.count; i++){
        //     const v = new THREE.Vector3()
        //         .fromBufferAttribute(this.vertices, i).normalize();
        //     this.nPos.push(v);
        // }
        this.geometry.userData.nPos = this.nPos;
        this.displace();
        this.geometry.computeVertexNormals();


        // Mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        console.log('generated');
    }
}