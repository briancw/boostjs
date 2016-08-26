const io = require('socket.io-client');
const hash = require('object-hash');
const path = require('path');
const Stream = require('./store/client-stream');
// import Stream from './store/client-stream.js';

class Boost {

    subscribe(path) {
        let ret = {};
        ret.data = null;

        this.socket = io.connect(path, {transports: ['websocket']});

        let stream = new Stream(path, this).start(ret);

        return ret;
    }
}

module.exports = new Boost();
