import * as THREE from "three";
import Stats from "stats.js";
import {Game} from "lazer-game-core";

import PlayerManager from "./objects/player/PlayerManager.js";
import PlayerControls from "./PlayerControls.js";
import { getURLSearchSettings } from "./utils.js";
import Tilemap from "./objects/tilemap/Tilemap.js";
import * as messageTypes from "./messageTypes.js";
import BulletManager from "./objects/bullet/BulletManager.js";

const CAMERA_OFFSET = new THREE.Vector3(0, 400, 150);
const SUN_OFFSET = new THREE.Vector3(-0.8, 1, -0.4).multiplyScalar(300);
const PING_INTERVAL = 1000;
export default class Client {
	constructor(game) {
		this.clock = new THREE.Clock();

		// create the renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.canvas = this.renderer.domElement;

		// enable shadows
		if (getURLSearchSettings().shadows) {
			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.BasicShadowMap;
		}

		// create the game
		this.game = game || new Game();

		// create scene
		this.scene = new THREE.Scene();

		// create the camera
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
		this.scene.add(this.camera);

		// resize the renderer and camera
		window.addEventListener("resize", () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize(window.innerWidth, window.innerHeight);
		});

		// let there be light...
		this.scene.add(new THREE.AmbientLight(0x111111));

		// create the sun
		this.sun = new THREE.DirectionalLight("white", 0.1);
		this.sun.castShadow = getURLSearchSettings().shadows;
		this.sun.position.copy(SUN_OFFSET);

		// set up the shadow map
		this.sun.shadow.mapSize.width = 1024;
		this.sun.shadow.mapSize.height = 1024;
		this.sun.shadow.camera.near = 0.5;
		this.sun.shadow.camera.far = 1000;
		this.sun.shadow.camera.bottom = this.sun.shadow.camera.left = -350;
		this.sun.shadow.camera.top = this.sun.shadow.camera.right = 350;

		// add the suns target to its self so that its relative
		this.sun.add(this.sun.target);
		this.sun.target.position.copy(SUN_OFFSET).negate();

		this.scene.add(this.sun);

		// if debug is enabled then add the sun helper
		if (getURLSearchSettings().debug) {
			this.sun.helper = new THREE.CameraHelper(this.sun.shadow.camera);
			this.scene.add(this.sun.helper);
		}

		// create the players
		this.players = new PlayerManager(this.game.players);
		this.scene.add(this.players);

		// create the controller
		this.playerControls = new PlayerControls(this, this.players);

		// create the bullets
		this.bullets = new BulletManager(this.game.bullets);
		this.bullets.position.y = 10;
		this.scene.add(this.bullets);

		// create the map
		this.map = new Tilemap(this.game.map);
		this.map.scale.multiplyScalar(50);
		this.scene.add(this.map);

		// create stats
		this.stats = new Stats();
		this.stats.ping = this.stats.addPanel(new Stats.Panel("ping", "#ff8", "#221"));
		this.stats.bullets = this.stats.addPanel(new Stats.Panel("bullets", "#f8f", "#212"));
		document.body.appendChild(this.stats.dom);
		this.stats.showPanel(0);

		this.update();
	}

	update() {
		requestAnimationFrame(this.update.bind(this));

		let d = this.clock.getDelta();

		// update the controls
		this.playerControls.update(d);

		// update the game
		this.game.update();

		// update the players
		this.players.update(d);

		// update the bullets
		this.bullets.update(d);

		if (this.players.localPlayerModel) {
			// update the camera
			let pos = this.players.localPlayerModel.getWorldPosition();
			this.camera.position.copy(pos).add(CAMERA_OFFSET);
			this.camera.lookAt(pos);

			// move the sun along with the player
			this.sun.position.copy(pos).add(SUN_OFFSET);
			if (this.sun.helper) this.sun.helper.update();
		}

		this.render(d);

		// update the stats counter
		this.stats.update();
		this.stats.bullets.update(
			this.game.bullets.bullets.length,
			(this.stats.bullets.max = Math.max(this.stats.bullets.max || 1, this.game.bullets.bullets.length)),
		);
	}

	render(d) {
		// render
		this.renderer.render(this.scene, this.camera);
	}

	attach(socket) {
		// return if its already attached
		if (this.socket) return this;

		this.socket = socket;
		this.playerControls.attach(socket);

		// update the players
		this.socket.on(messageTypes.PLAYER_POSITIONS, players => {
			for (let id in players) {
				let player = this.game.getPlayer(id);
				if (!player) continue;
				player.setPosition(...players[id]);
			}
		});
		this.socket.on(messageTypes.PLAYER_INFO_CHANGED, ({ id, info }) => {
			let player = this.game.getPlayer(id);
			if (player) player.setInfo(info);
		});
		this.socket.on(messageTypes.PLAYER_PROPS_CHANGED, ({ id, props }) => {
			let player = this.game.getPlayer(id);
			if (player) player.setInfo(props);
		});
		this.socket.on(messageTypes.PLAYER_CREATED, ({ id, data }) => {
			let player = this.game.createPlayer(id);
			player.fromJSON(data);

			console.log(`${data.info.name} (${data.id}) joined the game`);
		});
		this.socket.on(messageTypes.PLAYER_REMOVED, ({ id }) => {
			let player = this.game.getPlayer(id);
			this.game.removePlayer(player);

			console.log(`${player.info.name} (${player.id}) left the game`);
		});

		// bullet messages
		this.socket.on(messageTypes.BULLET_CREATED, data => {
			this.game.bullets.createFromJSON(data);
		});
		this.socket.on(messageTypes.BULLET_REMOVED, ({ id }) => {
			this.game.bullets.removeBullet(id);
		});
		this.socket.on(messageTypes.BULLET_PROPS_CHANGED, ({ id, props }) => {
			let bullet = this.game.bullets.getBullet(id);
			if (bullet) bullet.setProp(props);
		});

		setInterval(() => {
			let start = new Date();
			this.socket.emit("__ping__", {}, () => {
				let dtime = new Date() - start;
				this.stats.ping.max = Math.max(dtime, this.stats.ping.max || 0);
				this.stats.ping.update(dtime, this.stats.ping.max);
			});
		}, PING_INTERVAL);
		return this;
	}
}
