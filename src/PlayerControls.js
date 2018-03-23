import { KeyboardInput, MouseInput } from "./Input.js";
import * as messageTypes from "./messageTypes.js";

export default class PlayerControls {
	constructor(game, players) {
		this.game = game;
		this.players = players;
		this.socket = undefined;
		this.keyboard = new KeyboardInput();
		this.mouse = new MouseInput();
		this.cache = {};

		this.directionTime = 0;
	}

	attach(socket) {
		this.socket = socket;
	}

	// keyboard events
	keysAnyDown(...keys) {
		// return true if the keys where just pressed
		let cacheKey = `keyboard|${keys.join("-")}|down`;
		let state = this.keyboard.isAnyDown(...keys);
		if (state !== this.cache[cacheKey]) {
			this.cache[cacheKey] = state;
			return state;
		}

		return false;
	}
	keysAllDown(...keys) {
		// return true if the keys where just pressed
		let cacheKey = `keyboard|${keys.join("-")}|down`;
		let state = this.keyboard.isAllDown(...keys);
		if (state !== this.cache[cacheKey]) {
			this.cache[cacheKey] = state;
			return state;
		}

		return false;
	}
	keysAnyUp(...keys) {
		// return true if the keys where just released
		let cacheKey = `keyboard|${keys.join("-")}|up`;
		let state = this.keyboard.isAnyUp(...keys);
		if (state !== this.cache[cacheKey]) {
			this.cache[cacheKey] = state;
			return state;
		}

		return false;
	}
	keysAllUp(...keys) {
		// return true if the keys where just released
		let cacheKey = `keyboard|${keys.join("-")}|up`;
		let state = this.keyboard.isAllUp(...keys);
		if (state !== this.cache[cacheKey]) {
			this.cache[cacheKey] = state;
			return state;
		}

		return false;
	}

	// mouse events
	mouseAnyDown(...buttons) {
		// return true if the mouse buttons where just pressed
		let cacheKey = `mouse|${buttons.join("-")}|down`;
		let state = this.mouse.isAnyDown(...buttons);
		if (state !== this.cache[cacheKey]) {
			this.cache[cacheKey] = state;
			return state;
		}

		return false;
	}
	mouseAllDown(...buttons) {
		// return true if the mouse buttons where just pressed
		let cacheKey = `mouse|${buttons.join("-")}|down`;
		let state = this.mouse.isAllDown(...buttons);
		if (state !== this.cache[cacheKey]) {
			this.cache[cacheKey] = state;
			return state;
		}

		return false;
	}
	mouseAnyUp(...buttons) {
		// return true if the mouse buttons where just released
		let cacheKey = `mouse|${buttons.join("-")}|up`;
		let state = this.mouse.isAnyUp(...buttons);
		if (state !== this.cache[cacheKey]) {
			this.cache[cacheKey] = state;
			return state;
		}

		return false;
	}
	mouseAllUp(...buttons) {
		// return true if the mouse buttons where just released
		let cacheKey = `mouse|${buttons.join("-")}|up`;
		let state = this.mouse.isAllUp(...buttons);
		if (state !== this.cache[cacheKey]) {
			this.cache[cacheKey] = state;
			return state;
		}

		return false;
	}

	sendPlayerControlCommand(data) {
		if (this.socket) this.socket.emit(messageTypes.UPDATE_CONTROLS, data);

		if (this.players && this.players.localPlayer) this.players.localPlayer.setControl(data);
	}

	update(d) {
		if (!this.socket) return;

		// move X
		if (this.keysAnyDown("a", "ArrowLeft")) this.sendPlayerControlCommand({ moveX: -1 });

		if (this.keysAnyDown("d", "ArrowRight")) this.sendPlayerControlCommand({ moveX: 1 });

		// when all the keys are up, stop moving
		if (this.keysAllUp("a", "d", "ArrowLeft", "ArrowRight")) this.sendPlayerControlCommand({ moveX: 0 });

		// moveY
		if (this.keysAnyDown("w", "ArrowUp")) this.sendPlayerControlCommand({ moveY: -1 });

		if (this.keysAnyDown("s", "ArrowDown")) this.sendPlayerControlCommand({ moveY: 1 });

		// when all the keys are up, stop moving
		if (this.keysAllUp("s", "w", "ArrowUp", "ArrowDown")) this.sendPlayerControlCommand({ moveY: 0 });

		// send the direction
		let direction = Math.atan2(
			this.mouse.position.clientY - window.innerHeight / 2,
			this.mouse.position.clientX - window.innerWidth / 2,
		);

		// if there is a local player updated it now
		if (this.players.localPlayer) this.players.localPlayer.position.direction = direction;

		// if the direction is changed send it to the server
		this.directionTime += d;
		if (this.directionTime > 1 / 4 && this.players.localPlayer.controls.direction !== direction)
			this.sendPlayerControlCommand({ direction });

		// shoot
		if (this.mouseAnyDown("main")) this.sendPlayerControlCommand({ shoot: true });
		if (this.mouseAllUp("main")) this.sendPlayerControlCommand({ shoot: false });
	}
}
