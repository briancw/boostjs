const Vue = require('vue');
const Router = require('vue-router');
const io = require('socket.io-client');
const hash = require('object-hash');
const path = require('path');
const Stream = require('./store/client-stream');
// const resource = require('vue-resource');

Vue.use(Router);

class Boost {
    constructor() {
        this.vue = Vue;
        this.socket = io.connect('/application', {transports: ['websocket']});
        this.registerListeners();
    }

    start(routes) {
        let router = new Router({
            mode: 'history',
            history: true,
            routes,
        });

        new Vue({
            router,
        }).$mount('#app');

        this.router.beforeEach(function(transition) {
            window.scrollTo(0, 0);
            // if (!transition.to.matched) {
            //     transition.redirect('/404');
            // }
            transition.next();
        });
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
        });
    }

    login() {

    }

    logout() {
        let token = localStorage.token;
        console.log('auth:logging-out');

        this.socket.emit('auth.logout', token, () => {
            console.log('auth:logged-out');
            localStorage.removeItem('token');
        });
    }

}

module.exports = new Boost();
