import * as THREE from "three";
import getTileModel from "./tiles.js";

export default class TilemapTile extends THREE.Group {
	constructor(json) {
		super();

		// create the models
		json.forEach(data => {
			let model = new THREE.Mesh(
				getTileModel(data.model),
				new THREE.MeshPhongMaterial({
					vertexColors: THREE.VertexColors,
				}),
			);
			model.position.set(0.5, 0, 0.5);
			model.castShadow = true;
			model.receiveShadow = true;
			model.rotation.set(0, THREE.Math.degToRad(data.rotation), 0);

			this.add(model);
		});
	}
}
