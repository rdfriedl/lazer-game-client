import { Emitter } from "regexp-events";

/*
	Events:
	object-created(object)
	object-removed(object)
	objects-cleared(objects)

	object-used(object)
	object-released(object)
 */
export default class ObjectPool extends Emitter {
	constructor(cls) {
		super();

		this.cls = cls;
		this.available = [];
		this.inUse = [];
	}

	/**
	 * creates a new object and puts it in the available array
	 * @param  {Number} amount the number of objects to create
	 * @return {Object|Object[]} if the amount == 1 then it returns the created object, else it returns an array of objects
	 */
	allocate(amount = 1, addToAvailable = true) {
		if (amount === 1) {
			let object = new this.cls(); // eslint-disable-line
			if (addToAvailable) this.available.push(object);

			this.emit("object-created", object);
			return object;
		} else {
			let objects = [];
			for (let i = 0; i < amount; i++) {
				let object = new this.cls(); // eslint-disable-line
				if (addToAvailable) this.available.push(object);
				this.emit("object-created", object);
				objects.push(object);
			}

			return objects;
		}
	}

	newObject(...args) {
		let object = this.available.shift() || this.allocate(1, false);
		this.inUse.push(object);

		// set up the object
		if (object.poolInit) object.poolInit(...args);

		this.emit("object-used", object);
		return object;
	}

	releaseObject(object, ...args) {
		if (this.inUse.includes(object)) {
			if (object.poolDispose) object.poolDispose(...args);

			this.inUse.splice(this.inUse.indexOf(object), 1);
			this.available.push(object);

			this.emit("object-released", object);
		}
		return this;
	}

	/**
	 * removes the object from all arrays and frees it for GC
	 * @param  {*} object
	 * @return {this}
	 */
	removeObject(object) {
		if (this.includes(object)) {
			if (this.inUse.includes(object)) this.inUse.splice(this.inUse.indexOf(object), 1);

			if (this.available.includes(object)) this.available.splice(this.available.indexOf(object), 1);

			this.emit("object-removed", object);
		}
		return this;
	}

	includes(object) {
		return this.inUse.includes(object) || this.available.includes(object);
	}

	removeAll() {
		let removed = [...this.inUse, ...this.available];
		this.available = [];
		this.inUse = [];
		removed.forEach(object => this.emit("object-removed"));
		this.emit("objects-cleared", removed);
		return this;
	}
}
