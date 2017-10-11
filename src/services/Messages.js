import axios from 'axios';

/* global WebSocket */

export default class Messages {

    constructor(socketAddr) {
        this._socketAddr = socketAddr;
        this._ready = false;
        this._callbacks = [];

        this._createSocket();
    }

    _createSocket() {
        return new Promise((resolve, reject) => {
            this._socket = new WebSocket(this._socketAddr);
            this._socket.addEventListener('open', event => {
                this._ready = true;
                resolve();
            });
            this._socket.addEventListener('close', event => {
                this._ready = false;
            });
            this._socket.addEventListener('error', event => {
                this._ready = false;
                reject();
            });
            this._socket.addEventListener('message', event => {
                var data = JSON.parse(event.data);
                this._callbacks.forEach(cb => {
                    cb(data);
                });
            });
        });
    }

    getOld() {
        return axios.get('/old-messages').then(response => {
            return response.data;
        });
    }

    send(from, message) {
        if(this._ready) {
            return new Promise((resolve, reject) => {
                this._socket.send(JSON.stringify({
                    from,
                    message
                }));
                resolve();
            });
        } else {
            this._createSocket().then(() => {
                return this.send(from, message);
            });
        }
    }

    onNew(callback) {
        this._callbacks.push(callback);
    }

};
