import { Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { android as androidApp } from "tns-core-modules/application";

export function listenToBluetoothEnabled(): Observable<boolean> {
    return new Observable<boolean>(observer => {
        observer.next(android.bluetooth.BluetoothAdapter.getDefaultAdapter().isEnabled());
        androidApp.registerBroadcastReceiver(
            android.bluetooth.BluetoothAdapter.ACTION_STATE_CHANGED,
            (context, intent) => {
                // const state = intent.getIntExtra(android.bluetooth.BluetoothAdapter.EXTRA_STATE, android.bluetooth.BluetoothAdapter.ERROR);
                observer.next(android.bluetooth.BluetoothAdapter.getDefaultAdapter().isEnabled());
            });
        return () => androidApp.unregisterBroadcastReceiver(android.bluetooth.BluetoothAdapter.ACTION_STATE_CHANGED);
    }).pipe(distinctUntilChanged());
}

export function startBluetooth() {
    return androidApp.foregroundActivity.startActivityForResult(
        new android.content.Intent(android.bluetooth.BluetoothAdapter.ACTION_REQUEST_ENABLE), 
        1);
}

export function connect(address) {
    const adapter = android.bluetooth.BluetoothAdapter.getDefaultAdapter();
    const target = adapter.getRemoteDevice(address);
    const btSocket = target.createInsecureRfcommSocketToServiceRecord(java.util.UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"));
    adapter.cancelDiscovery();
    btSocket.connect();
    
    return btSocket;
}

