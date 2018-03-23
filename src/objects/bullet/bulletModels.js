import * as THREE from "three";
import BulletModel from "./BulletModel.js";
import {BulletManager} from "lazer-game-core";

let loader = new THREE.TextureLoader();
let map = loader.load(require("../../res/img/default_bullet.png"));

export class DefaultBulletModel extends BulletModel {
	constructor(bullet) {
		super(bullet);

		let material = new THREE.SpriteMaterial({
			map: map,
			color: 0xff0000,
		});

		this.sprite = new THREE.Sprite(material);
		this.sprite.scale.multiplyScalar(30);
		this.add(this.sprite);
	}
	poolInit(...args) {
		super.poolInit(...args);
		this.sprite.visible = true;

		// set the sprite to the players color
		let player = this.bullet.manager.game.players.getPlayer(this.bullet.info.owner);
		this.sprite.material.color.setHSL(player.info.color / 360, 0.8, 0.6);
	}
	poolDispose(...args) {
		this.sprite.visible = false;
		super.poolDispose(...args);
	}
	update() {
		// update the position
		this.sprite.position.set(this.bullet.data.position.x, this.position.y, this.bullet.data.position.y);
		this.sprite.material.rotation = this.bullet.data.direction + Math.PI;
	}
}

const modelTypes = {
	[BulletManager.BULLET_TYPE.DEFAULT]: DefaultBulletModel,
};

export { modelTypes as default };
