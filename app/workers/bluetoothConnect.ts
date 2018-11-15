import 'globals';

const context: Worker = self as any;
let btSocket: globalAndroid.bluetooth.BluetoothSocket;
let messages: string[] = [];
let interval;

context.onmessage = function (msg) {
    if (msg.data.address) {
        connect(msg.data.address);
    } else if (msg.data.disconnect) {
        closeConnection();
    } else if (msg.data.message) {
        messages.push(msg.data.message);
    }
}

function connect(address) {
    try {
        const adapter = android.bluetooth.BluetoothAdapter.getDefaultAdapter();
        const target = adapter.getRemoteDevice(address);
        btSocket = target.createRfcommSocketToServiceRecord(java.util.UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"));
        btSocket.connect();

        interval = setInterval(() => {
            if (!btSocket.isConnected()) {
                clearInterval(interval);
                context.postMessage('disconnected');
            } else {
                try {
                    const read = btSocket.getInputStream().read();
                    if (read > -1) {
                        let bytes = 0;
                        while(messages.length && bytes < 60) {
                            bytes += sendNextMessage();
                        }
                        btSocket.getInputStream().skip(btSocket.getInputStream().available())
                    }
                } catch(e) {
                    context.postMessage('message-error');
                    if (e.message.startsWith('java.io.IOException: bt socket closed')) {
                        closeConnection();
                    }
                }
            }
        });

        context.postMessage('connected');
    } catch(e) {
        context.postMessage('connection-error');
        context.postMessage(e);
    }
}

function closeConnection() {
    try{
        btSocket.close();
    } catch(e){}
    clearInterval(interval);
    context.postMessage('disconnected');
}

function sendMessage(message) {
    let bytes = [];
    for (var i=0; i < message.length; i++) {
      bytes.push(message.charCodeAt(i));
    }
    bytes.push(13)
    btSocket.getOutputStream().write(bytes);
}

function sendNextMessage() {
    let message = messages.shift();
    if (message) {
        let bytes = [90, 90, 90];
        for (var i=0; i < message.length; i++) {
          bytes.push(message.charCodeAt(i));
        }
        bytes.push(13)
        btSocket.getOutputStream().write(bytes);
        return bytes.length;
    }
}
