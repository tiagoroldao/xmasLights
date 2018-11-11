import 'globals';

const context: Worker = self as any;
let btSocket: globalAndroid.bluetooth.BluetoothSocket;
let messages: string[] = [];

context.onmessage = function (msg) {
    if (msg.data.address) {
        connect(msg.data.address);
    } else if (msg.data.disconnect) {
        btSocket.close();
        context.postMessage('disconnected');
    } else if (msg.data.message) {
        // messages.push(msg.data.message);
        sendMessage(msg.data.message);
    }
}

function connect(address) {
    try {
        const adapter = android.bluetooth.BluetoothAdapter.getDefaultAdapter();
        const target = adapter.getRemoteDevice(address);
        btSocket = target.createInsecureRfcommSocketToServiceRecord(java.util.UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"));
        adapter.cancelDiscovery();
        btSocket.connect();

        setInterval(() => {
            if (!btSocket.isConnected()) {
                context.postMessage('disconnected');
            } else {
                while(messages.length) {
                    sendNextMessage();
                }
            }
        }, 30);

        context.postMessage('connected');
    } catch(e) {
        context.postMessage('connection-error');
    }
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
        let bytes = [90];
        for (var i=0; i < message.length; i++) {
          bytes.push(message.charCodeAt(i));
        }
        bytes.push(13)
        btSocket.getOutputStream().write(bytes);
    }
}
