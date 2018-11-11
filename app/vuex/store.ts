import Vuex from 'vuex';
import { listenToBluetoothEnabled } from '../util/bluetooth';
import * as BTWorker from "nativescript-worker-loader!../workers/bluetoothConnect.ts";

export function createStore() {
    const store = new Vuex.Store({
        state: {
            bluetoothEnabled: true,
            btSocket: null,
        },
        mutations: {
            setBluetoothEnabled(state, { enabled }) {
                state.bluetoothEnabled = enabled;
            },
            setBtSocket(state, { btSocket }) {
                state.btSocket = btSocket;
            }
        },
        actions: {
            init({ commit }) {
                listenToBluetoothEnabled().subscribe(enabled => commit('setBluetoothEnabled', { enabled }));
            },
            connectToDevice({ commit, state }, { address }) {
                return new Promise((resolve, reject) => {
                    const worker = new BTWorker();
                    worker.postMessage({ address });

                    worker.onmessage = function (msg) {
                        console.log('btWorker message', msg);
                        if (msg.data === 'connected') {
                            commit('setBtSocket', { btSocket: worker })
                            resolve(msg.data);
                        } else if (msg.data === 'disconnected' || msg.data === 'connection-error') {
                            if (msg.data === 'connection-error') {
                                reject('connection-error');
                            }
                            worker.terminate();
                            commit('setBtSocket', { btSocket: null })
                        }
                    }

                    worker.onerror = function (err) {
                        reject(err);
                    }
                });
            },
            disconnectBtSocket({ state }) {
                state.btSocket.postMessage({ disconnect: true });
            },
            sendBTMessage({ state }, { message }) {
                state.btSocket.postMessage({ message });
            }
        }
    })

    store.dispatch('init');

    return store;
};