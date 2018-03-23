import * as THREE from "three";
import {Bullet} from "lazer-game-core";
import modelTypes from "./bulletModels.js";
import ObjectPool from "../../ObjectPool.js";
import BulletModel from "./BulletModel.js";

export default class BulletManager extends THREE.Group {
	constructor(manager) {
		super();

		this.manager = manager;
		this.models = new WeakMap();
		this.pools = new Map();

		// bind events
		this.manager.on("bullet-created", bullet => this.createModel(bullet));
		this.manager.on("bullet-removed", bullet => this.releaseModel(bullet));

		// allocate 30 bullets of each type
		for (let typeID in BulletManager.ModelTypes) this.getModelPool(BulletManager.ModelTypes[typeID]).allocate(20);
	}

	getBullet(id) {
		if (id instanceof BulletModel) id = id.bullet;
		else if (id instanceof Bullet) return id;

		return this.manager.getBullet(id);
	}

	getModel(id) {
		let bullet = this.getBullet(id);
		return this.models.get(bullet);
	}

	hasModel(id) {
		let bullet = this.getBullet(id);
		return this.models.has(bullet);
	}

	createModel(id) {
		let bullet = this.getBullet(id);
		let type = BulletManager.ModelTypes[bullet.type];
		if (!type) return;

		let pool = this.getModelPool(type);
		let model = pool.newObject(bullet);
		this.models.set(bullet, model);

		return model;
	}

	removeModel(id) {
		let bullet = this.getBullet(id);
		let model = this.getModel(bullet);

		this.models.delete(bullet);
		this.getModelPool(model.constructor).removeObject(model);

		return this;
	}
	releaseModel(id) {
		let bullet = this.getBullet(id);
		let model = this.getModel(bullet);

		this.models.delete(bullet);
		this.getModelPool(model.constructor).releaseObject(model);

		return this;
	}
	clearModels() {
		this.pools.forEach(pool => pool.removeAll());
		return this;
	}

	update(d) {
		this.manager.bullets.forEach(bullet => {
			let bulletModel = this.models.get(bullet);
			if (bulletModel) bulletModel.update(d);
			else if (process.env.NODE_ENV !== "production") console.warn("missing model for bullet", bullet);
		});
	}

	getModelPool(type) {
		if (typeof type == "string") type = BulletManager.ModelTypes[type];

		if (!type) return;
		if (!this.pools.has(type)) {
			let pool = new ObjectPool(type);

			pool.on("object-created", object => this.add(object));
			pool.on("object-removed", object => this.remove(object));

			this.pools.set(type, pool);
		}

		return this.pools.get(type);
	}
}

// set the model types
BulletManager.ModelTypes = modelTypes;
