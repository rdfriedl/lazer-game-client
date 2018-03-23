import * as THREE from "three";
import { BulletManager } from "lazer-game-core";
const DefaultBullet = BulletManager.BulletTypes.default;

export default class PlayerModel extends THREE.Mesh {
	constructor(player) {
		super(new THREE.SphereBufferGeometry(10, 24, 24), new THREE.MeshToonMaterial());
		this.position.y = 10;
		this.receiveShadow = true;

		this.player = player;

		// add a light
		this.light = new THREE.PointLight(0xffffff, 1, 180);
		this.light.castShadow = true;
		this.light.shadow.camera.near = 1;
		this.light.shadow.camera.far = 150;
		this.light.shadow.bias = 0.01;

		this.add(this.light);

		// create aiming line
		this.line = new THREE.Line(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial({
				opacity: 0.5,
			}),
		);
		for (let i = 0; i < 100; i++) {
			this.line.geometry.vertices.push(new THREE.Vector3());
		}
		this.add(this.line);

		// create the health bar
		this.health = new THREE.Group();
		this.health.position.set(0, 30, -10);

		this.healthMesh = new THREE.Mesh(
			new THREE.BoxBufferGeometry(40, 6, 6, 1, 1, 1),
			new THREE.MeshBasicMaterial({
				transparent: true,
				opacity: 0.5,
				depthTest: false,
			}),
		);
		this.healthFullColor = new THREE.Color(0x00ff00);
		this.healthEmptyColor = new THREE.Color(0xff0000);
		this.health.add(this.healthMesh);

		this.healthBox = new THREE.BoundingBoxHelper(this.healthMesh, 0xaaaaaa);
		this.health.add(this.healthBox);

		this.add(this.health);

		// bind events
		this.player.on("info-changed", this.updateInfo.bind(this));
		this.player.on("props-changed", this.updateProps.bind(this));
	}

	update(d) {
		this.position.set(this.player.body.position[0], this.position.y, this.player.body.position[1]);

		// update the health bar
		this.healthMesh.scale.x = this.player.props.health / 150;
		this.healthMesh.material.color.copy(
			this.healthEmptyColor.clone().lerp(this.healthFullColor, this.player.props.health / 150),
		);

		// update line
		let path = DefaultBullet.calcPath(this.player.game.world, {
			start: [this.position.x, this.position.z],
			direction: this.player.position.direction,
			maxDistance: 300,
		});
		let pathLength = path.length ? path[path.length - 1][2] : 1;

		// set the vertices
		this.line.geometry.vertices.forEach((v, i, arr) => {
			let vertexPosition = i / arr.length * pathLength;
			let point = DefaultBullet.pointOnPath(path, vertexPosition);
			v.set(point.x - this.position.x, 0, point.y - this.position.z);
		});

		// update the geometry
		this.line.geometry.verticesNeedUpdate = true;
	}

	setPosition(data) {
		this.body.position[0] = data.x;
		this.body.position[1] = data.y;
		this.velocity.set(data.vx, data.vy);

		this.updatePosition();
	}

	updateInfo() {
		this.material.color.setHSL(this.info.color / 360, 0.8, 0.6);
		this.light.color.copy(this.material.color);
		this.line.material.color.copy(this.material.color);

		return this;
	}
	updateProps() {
		return this;
	}

	get id() {
		return this.player.id;
	}
	get info() {
		return this.player.info;
	}
	get props() {
		return this.player.props;
	}
	get controls() {
		return this.player.controls;
	}
}
