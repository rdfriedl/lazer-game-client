export class KeyboardInput {
	constructor() {
		this.keyStates = new Map();

		window.addEventListener("keydown", e => {
			this.keyStates.set(e.code, true);
			this.keyStates.set(e.key, true);
		});
		window.addEventListener("keyup", e => {
			this.keyStates.set(e.code, false);
			this.keyStates.set(e.key, false);
		});
	}

	isDown(key) {
		return this.keyStates.get(key);
	}
	isUp(key) {
		return !this.keyStates.get(key);
	}

	isAnyDown(...keys) {
		for (var i = 0; i < keys.length; i++) {
			if (this.keyStates.get(keys[i])) return true;
		}
		return false;
	}
	isAnyUp(...keys) {
		for (var i = 0; i < keys.length; i++) {
			if (!this.keyStates.get(keys[i])) return true;
		}
		return false;
	}

	isAllDown(...keys) {
		for (var i = 0; i < keys.length; i++) {
			if (!this.keyStates.get(keys[i])) return false;
		}
		return true;
	}
	isAllUp(...keys) {
		for (var i = 0; i < keys.length; i++) {
			if (this.keyStates.get(keys[i])) return false;
		}
		return true;
	}
}

const MOUSE_BUTTON_NAMES = {
	left: 0,
	main: 0,
	middle: 1,
	auxiliary: 1,
	right: 2,
	secondary: 2,
	mb4: 3,
	mb5: 4,
};
export class MouseInput {
	constructor() {
		this.buttonStates = new Map();
		this.position = {
			screenX: 0,
			screenY: 0,
			clientX: 0,
			clientY: 0,
			pageX: 0,
			pageY: 0,
		};

		window.addEventListener("mousemove", e => {
			this.position.screenX = e.screenX;
			this.position.screenY = e.screenY;
			this.position.clientX = e.clientX;
			this.position.clientY = e.clientY;
			this.position.pageX = e.pageX;
			this.position.pageY = e.pageY;
		});

		window.addEventListener("mousedown", e => {
			this.buttonStates.set(e.button, true);
			for (let name in MOUSE_BUTTON_NAMES) if (MOUSE_BUTTON_NAMES[name] == e.button) this.buttonStates.set(name, true);
		});
		window.addEventListener("mouseup", e => {
			this.buttonStates.set(e.button, false);
			for (let name in MOUSE_BUTTON_NAMES) if (MOUSE_BUTTON_NAMES[name] == e.button) this.buttonStates.set(name, false);
		});
	}

	isDown(button) {
		return this.buttonStates.get(button);
	}
	isUp(button) {
		return !this.buttonStates.get(button);
	}

	isAnyDown(...buttons) {
		for (var i = 0; i < buttons.length; i++) {
			if (this.buttonStates.get(buttons[i])) return true;
		}
		return false;
	}
	isAnyUp(...buttons) {
		for (var i = 0; i < buttons.length; i++) {
			if (!this.buttonStates.get(buttons[i])) return true;
		}
		return false;
	}

	isAllDown(...buttons) {
		for (var i = 0; i < buttons.length; i++) {
			if (!this.buttonStates.get(buttons[i])) return false;
		}
		return true;
	}
	isAllUp(...buttons) {
		for (var i = 0; i < buttons.length; i++) {
			if (this.buttonStates.get(buttons[i])) return false;
		}
		return true;
	}
}

const ex = {
	KeyboardInput,
	MouseInput,
};
export { ex as default };
