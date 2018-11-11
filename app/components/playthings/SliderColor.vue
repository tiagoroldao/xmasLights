<template>
    <GridLayout columns="*" rows="*" backgroundColor="lightgray" @touch="onTouch" ref="slideGrid">
        <Label 
            text="" 
            col="0" 
            row="0"/>
    </GridLayout>
</template>

<script>
import * as _ from "lodash";
import * as chroma from "chroma-js";

export default {
  data() {
    return {};
  },
  created() {
    this.throttledOnTouch = _.throttle((x, y) => {
      const size = this.$refs.slideGrid._nativeView.getActualSize();
      y = Math.min(size.height, Math.max(0, y));
      y = 100 - Math.round((y / size.height) * 100);
      x = Math.min(size.width, Math.max(0, x));
      x = Math.round((x / size.width) * 255);
      this.$emit('message', `C-${x}-${y}`);
    }, 30);
  },
  methods: {
    onTouch(event) {
      this.throttledOnTouch(event.getX(), event.getY());
    }
  }
};
</script>

<style scoped lang="scss">
</style>
