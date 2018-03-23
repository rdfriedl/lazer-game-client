import * as THREE from "three";
import Tile from "./Tile.js";

export default class Tilemap extends THREE.Group {
	constructor(tilemap) {
		super();

		this.map = tilemap;
		this.tiles = [];

		// create the floor
		this.floor = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(1, 1, 1, 1),
			new THREE.MeshPhongMaterial({
				color: 0xcccccc,
			}),
		);
		this.floor.lookAt(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
		this.floor.receiveShadow = true;
		this.add(this.floor);
		this.resizeFloor();

		// bind events
		this.map.on("from-json", this.fromJSON.bind(this));
	}

	getTile(x, y) {
		if (x instanceof Object) return this.tiles.includes(x) ? x : undefined;
		else return this.tiles[y * this.size.width + x];
	}

	hasTile(x, y) {
		return !!this.getTile(x, y);
	}

	createTile(x, y, data = []) {
		this.removeTile(x, y);

		let tile = new Tile(data);
		tile.position.set(x, 0, y);
		this.add(tile);
		return tile;
	}

	removeTile(x, y) {
		let tile = this.getTile(x, y);
		if (!tile) return;
		this.tiles[this.tiles.indexOf(tile)] = undefined;
		this.remove(tile);
		return this;
	}

	clearTiles(x, y) {
		this.tiles.forEach(tile => {
			this.remove(tile);
		});
		this.tiles = [];
		return this;
	}

	resizeFloor() {
		if(this.size.width > 0 || this.size.height > 0){
			this.floor.position.set(this.size.width / 2, 0, this.size.height / 2);
			this.floor.scale.set(this.size.width, this.size.height, 1);
			this.floor.visible = true;
		}
		else{
			this.floor.visible = false;
		}
	}

	fromJSON(json) {
		Object.assign(this.size, json.size);

		for (let y = 0; y < json.tiles.length; y++) {
			for (let x = 0; x < json.tiles[y].length; x++) {
				let typeID = json.tiles[y][x];
				let type = json.types[typeID];
				if (!type) continue;
				this.createTile(x, y, type);
			}
		}

		this.resizeFloor();

		return this;
	}

	get size() {
		return this.map.size;
	}
}
