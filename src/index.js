import * as THREE from "three";
import Client from "./client.js";
import io from "socket.io-client";
import {Game} from "lazer-game-core";
import { createName, parseSearch } from "./utils.js";
import "./style.css";

window.THREE = THREE;

const findGameId = /(?:\/)(.+)\/?$/g;

let game = new Game();
let client = new Client(game);
document.getElementById("game").appendChild(client.canvas);

// try to connect to the server
let socket = io(process.env.SERVER_ADDRESS);
socket.io.reconnection(false);

socket.on("connect", () => {
	client.attach(socket);

	let query = parseSearch();
	let info = {
		name: query.name || createName(),
		color: query.color || Math.round(Math.random() * 360),
	};

	let gameID = findGameId.exec(location.pathname)[1];
	socket.emit(
		"join-game",
		{
			game: gameID,
			info: info,
		},
		data => {
			if (data) {
				console.log("joined game", data.game.id);

				// load the game
				client.game.fromJSON(data.game);

				// set the local player
				client.players.localPlayer = data.playerID;
			} else {
				console.error("failed to join room", gameID);
				// there was an error connecting
			}
		},
	);
});

socket.on("disconnect", () => {
	console.log("disconnected from the server");
});

if (process.env.NODE_ENV !== "production") {
	window.client = client;
}
