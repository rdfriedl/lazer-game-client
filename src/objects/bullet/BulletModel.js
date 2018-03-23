import * as THREE from "three";

export default class BulletModel extends THREE.Group {
	poolInit(bullet) {
		this.bullet = bullet;
		this.bullet.on("props-changed", this.propsChanged, this);
	}
	poolDispose() {
		this.bullet.off("props-changed", this.propsChanged, this);
		this.bullet = undefined;
	}

	update(d) {}

	propsChanged() {}

	get props() {
		return this.bullet.props;
	}
	get info() {
		return this.bullet.info;
	}
	get data() {
		return this.bullet.data;
	}
}
