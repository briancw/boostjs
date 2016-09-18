const io = require('socket.io-client');
const hash = require('object-hash');
const path = require('path');
const Stream = require('./store/client-stream');
// import Stream from './store/client-stream.js';

class Boost {

	constructor() {
		this.socket = io.connect('/application', {transports: ['websocket']});

		this.registerListeners();
	}

    subscribe(path) {
        let ret = {};
        ret.data = null;

        let stream = new Stream(path).start(ret);

        return ret;
    }

    registerListeners() {
    	console.log('listening');

    	// Any WebSocket listeners here...
    	
    	this.socket.on('connect', socket => {
    		console.log('app:ready!');
    	})

    }

    logout() {
    	let token = localStorage.token;
    	console.log('auth:logging-out');

    	this.socket.emit('auth.logout', token, () => {
    		console.log('auth:logged-out')
    		localStorage.removeItem('token');
    	});
    }

}

module.exports = new Boost();
