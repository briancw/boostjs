const crypto = require('crypto');
const differ = require('jsondiffpatch');
const io = require('socket.io-client');

class Stream
{
  constructor(name)
  {
    this.name = name;
    this.listeners = [];
    this.socket = io.connect(name, {transports: ['websocket']});
  }

  start(ret)
  {
     this.socket.on('connect', () => {
      this.socket.on('hash', hash => {
        console.log('initial hash', hash);


        if (localStorage[this.name] === undefined) {
          console.log('pre new');
          this.retrieve(ret);
        } else if (JSON.parse(localStorage[this.name]).id !== hash) {
          console.log('pre patch');
          console.log(JSON.parse(localStorage[this.name]).id, hash);
          this.hash = JSON.parse(localStorage[this.name]).id;
          this.patch(ret);
        } else {
          console.log('cached');
          ret.data = this.send(localStorage[this.name]);
        }
      });
    });

    return this;
  }

  grab(cb)
  {
    this.listeners.push(cb.bind(this));
  }

  send(data)
  {
    return JSON.parse(JSON.parse(JSON.parse(data).data));
  }

  // send(data)
  // {
  //   let listeners = this.listeners;
  //   data = JSON.parse(JSON.parse(data).data);
  //
  //   if (listeners.length > 0) {
  //     if (listeners.length > 1) {
  //       listeners.forEach(el => {
  //         el(data);
  //       });
  //     } else {
  //       listeners[0](data);
  //     }
  //   }
  // }

  retrieve(ret)
  {
    this.socket.emit('full', null, data => {
      console.log(data);
      let hash = crypto.createHash('md5').update(data).digest("hex");
      console.log('new');

      localStorage[this.name] = JSON.stringify({
        id: hash,
        data: data
      });


      ret.data = this.send(localStorage[this.name]);
    });
  }

  patch(ret)
  {
    this.socket.emit('patch', this.hash, data => {
      console.log(data);

      if (Array.isArray(data)) {
        console.log('patch');
        data = differ.patch(JSON.parse(localStorage[this.name]).data, data);
        console.log(data);
      } else {
        console.log('tried patch. need full.');
      }

      let hash = crypto.createHash('md5').update(data).digest("hex");

      localStorage[this.name] = JSON.stringify({
        id: hash,
        data: data
      });

      ret.data = this.send(localStorage[this.name]);
    });
  }

  call(action, props, cb)
  {
    let key = this.name + '.' + action;
    console.log('calling ' + action);
    props = props ? props : [];
    this.socket.emit(key, props, data => {
      cb(data);
    });

    // this.socket.on(key, data => {
    //   cb(data);
    // });
  }
}

module.exports = Stream;
