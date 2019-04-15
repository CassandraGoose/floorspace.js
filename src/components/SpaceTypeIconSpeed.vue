<template>
 <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="75 75 100 100" style="enable-background:new 75 75 100 100;" xml:space="preserve">
  <rect x="77.5" y="77.5" width="95" height="95" fill="#000000"></rect>
</svg>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'SpaceTypeIconSpeed',
  props: ['id'],
  computed: {
    ...mapState({
      projectSpaceTypes: state => state.models.library.space_types,
    }),
    squareColor() {
      const color = this.projectSpaceTypes.find(type => type.id === this.id);
      if (!color) return '#BEBEBE';
      return color.color;
    },
  },
};
</script>
<style>
</style>