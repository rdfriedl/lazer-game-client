import * as THREE from "three";
import "three/examples/js/loaders/PLYLoader.js";

export const TILE_IDS = {};
let loader = new THREE.PLYLoader();
let modelFolder = require.context("../../res/tiles/", false, /\.ply$/);
modelFolder.keys().forEach(file => {
	let name = file.replace(/(^.*\/|\.ply$)/gi, "");
	TILE_IDS[name] = loader.parse(modelFolder(file));
});

for (let id in TILE_IDS) {
	TILE_IDS[id].computeFaceNormals();
}

export default function getTileModel(id) {
	if (TILE_IDS[id]) return TILE_IDS[id];
	else return new THREE.BufferGeometry();
}
