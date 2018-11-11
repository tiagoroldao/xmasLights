<template>
    <Page>
        <ActionBar title="Lights!"/>
        <TabView :selectedIndex="tabIndex" ref="tabView" @selectedIndexChanged="onSelectedIndexChange">
          <TabViewItem title="On/Off">
            <OnOff @message="sendMessage"/>
          </TabViewItem>
          <TabViewItem title="Slide!">
            <Slider @message="sendMessage"/>
          </TabViewItem>
          <TabViewItem title="Canvas!">
            <Bulbs :active="tabIndex === 2" @message="sendMessage"/>
          </TabViewItem>
        </TabView>
    </Page>
</template>

<script>
import * as bluetooth from "nativescript-bluetooth";
import { Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { mapState } from "vuex";
import OnOff from '~/components/playthings/OnOff.vue';
import Slider from '~/components/playthings/Slider.vue';
import Bulbs from '~/components/playthings/Bulbs.vue';

export default {
  components: {
    OnOff,
    Slider,
    Bulbs
  },
  data() {
    return {
      tabIndex: 0,
    };
  },
  computed: {
    ...mapState(["bluetoothEnabled", "btSocket"])
  },
  mounted() {
    setTimeout(() => {
      let viewPager = this.$refs.tabView.$el.nativeView._viewPager;
      if (viewPager) {
        try {
          viewPager.setSwipePageEnabled(false);
        } catch(e) {/* ignore not being able to set swipe false */}
      }
    }, 300)
  },
  methods: {
    onSelectedIndexChange(event) {
      this.tabIndex = event.newIndex;
    },
    sendMessage(message) {
      this.$store.dispatch("sendBTMessage", { message });
    },
  },
  watch: {
    bluetoothEnabled: {
      handler() {
        if (!this.bluetoothEnabled) {
          this.$navigateBack();
        }
      },
      immediate: true
    },
    btSocket: {
      handler() {
        if (!this.btSocket) {
          this.$navigateBack();
        }
      }
    }
  }
};
</script>

<style scoped lang="scss">
ActionBar {
  background-color: #53ba82;
  color: #ffffff;
}
</style>
