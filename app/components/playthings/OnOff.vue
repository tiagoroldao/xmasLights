<template>
    <GridLayout columns="*,*" rows="*,*" backgroundColor="lightgray" >
        <Button 
            :class="['button', 'on']" 
            text="On" 
            @tap="sendMessage('1')" 
            col="0" 
            row="0"/>
        <Button 
            :class="['button', 'off']" 
            text="Off" 
            @tap="sendMessage('0')" 
            col="0" 
            row="1"/>
        <Button 
            :class="['button', 'wipe']" 
            text="Wipe!" 
            @tap="sendMessage('W')" 
            col="1" 
            row="0"/>
        <Button 
            :class="['button', 'theatre']" 
            text="Theater" 
            @tap="sendMessage('T')" 
            col="1" 
            row="1"/>
    </GridLayout>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    sendMessage(message) {
        this.$emit('message', message);
    },
  },
};
</script>

<style scoped lang="scss">
.button {
  font-size: 20;
  color: #333333;

  &.on {
    background-color: #2b8a56;
  }

  &.off {
    background-color: #ba5353;
  }

  &.theatre {
    background-color: #b1a005;
  }

  &.wipe {
    background-color: #9c099c;
  }

  &.disabled {
    background-color: #8b8b8b;
  }
}
</style>
