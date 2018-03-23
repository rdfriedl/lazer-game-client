import * as THREE from "three";
import PlayerModel from "./PlayerModel.js";
import {Player} from "lazer-game-core";

export default class PlayerManager extends THREE.Group {
	constructor(manager) {
		super();

		this.manager = manager;
		this.models = new Map();
		this._localPlayer = undefined;
		this._localPlayerID = undefined;

		// bind events
		this.manager.on("player-created", player => this.createModel(player));
		this.manager.on("player-removed", player => this.removeModel(player));
	}

	getPlayer(id) {
		if (id instanceof PlayerModel) id = id.player;

		return this.manager.getPlayer(id);
	}

	getModel(player) {
		if (player instanceof PlayerModel) player = player.player;

		if (!(player instanceof Player)) player = this.manager.getPlayer(player);

		return this.models.get(player);
	}

	hasModel(id) {
		if (id instanceof PlayerModel) id = id.player;

		let player = this.getPlayer(id);
		return this.models.has(player);
	}

	createModel(player) {
		delete this._localPlayer;

		let model = new PlayerModel(player);
		this.models.set(player, model);
		this.add(model);
		return model;
	}

	removeModel(player) {
		if (!(player instanceof Player)) {
			player = this.getPlayer(player);
			if (!player) return this;
		}

		let model = this.getModel(player);
		this.models.delete(player);
		this.remove(model);
		return this;
	}

	set localPlayer(id) {
		this._localPlayerID = id;
		this._localPlayer = this.getPlayer(id);
		return this._localPlayer;
	}
	get localPlayer() {
		return this._localPlayer || (this._localPlayer = this.getPlayer(this._localPlayerID));
	}
	get localPlayerModel() {
		return this.models.get(this._localPlayer);
	}

	update(d) {
		this.manager.players.forEach(player => {
			let playerModel = this.models.get(player);
			if (!playerModel) playerModel = this.createModel(player);

			playerModel.update(d);
		});
	}
}
