<template>
    <Page @navigatedTo="onInit">
        <ActionBar title="Select BT device"/>
        <GridLayout class='loading' v-if="loading" columns="*" rows="*">
          <ActivityIndicator :busy="loading" row="0" col="0"/>
        </GridLayout>
        <ListView v-else-if="bluetoothEnabled" for="device in devices" @itemTap="onItemTap" class="list-group">
          <v-template>
            <Label :text="device.name" class="list-group-item" />
          </v-template>
        </ListView>
        <GridLayout v-else columns="*" rows="*" backgroundColor="lightgray" >
            <Button 
              :class="['button', 'on', {disabled: !bluetoothEnabled}]" 
              text="Start Bluetooth" 
              @tap="startBluetooth" 
              col="0" 
              row="0"/>
        </GridLayout>
    </Page>
</template>

<script>
import { mapState } from 'vuex';
import { startBluetooth, connect } from '../util/bluetooth';
import PlaythingsVue from '~/components/Playthings.vue';
const androidBluetoothPkg = android.bluetooth;

export default {
  data() {
    return {
      devices: [],
      loading: false,
    };
  },
  computed: {
      ...mapState(['bluetoothEnabled', 'btSocket']),
  },
  watch: {
    bluetoothEnabled: {
      handler() {
        if (this.bluetoothEnabled) {
          this.getDevices();
        }
      },
      immediate: true,
    },
    btSocket: {
      handler() {
        if (this.btSocket) {
          this.$navigateTo(PlaythingsVue);
        }
      },
    }
  },
  methods: {
    onItemTap(event) {
      this.loading = true;
      this.$store.dispatch('connectToDevice', { address: event.item.address})
        .then((r) => {
          this.loading = false;
        }, (e) => {
          this.loading = false;
        });
    },
    startBluetooth() {
      let adapter = androidBluetoothPkg.BluetoothAdapter.getDefaultAdapter();
      if (adapter && !adapter.isEnabled()) {
        startBluetooth();
      }
    },
    getDevices() {
      let adapter = androidBluetoothPkg.BluetoothAdapter.getDefaultAdapter();
      if (adapter && adapter.isEnabled()) {
        let devices = adapter.getBondedDevices().toArray();

        for (var i = 0; i < devices.length; i++) {
          let device = devices[i];
          this.devices.push({
            name: device.getName(),
            address: device.getAddress()
          });
        }
      }
    },
    onInit() {
      if (this.btSocket) {
        this.$store.dispatch('disconnectBtSocket');
      }
      this.startBluetooth();
    }
  }
};
</script>

<style scoped>
  ActionBar {
    background-color: #53ba82;
    color: #ffffff;
  }

  Label.choice {
    background-color: white;
    border-top-width: 1px;
    border-top-color: #43b883;
    color: #999;
    padding: 10px 20px;
  }

  .loading {
    background-color: transparent;
  }
</style>
