<template>
    <Page>
        <ActionBar title="Tester"/>
        <Bulbs :active="true"/>
    </Page>
</template>

<script>
import Bulbs from '~/components/playthings/Bulbs.vue';

export default {
  components: {
    Bulbs
  },
  data() {
    return {};
  },
};
</script>

<style scoped lang="scss">
ActionBar {
  background-color: #53ba82;
  color: #ffffff;
}
</style>
