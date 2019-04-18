<template>
  <svg id="space-cube" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100" viewBox="0 0 100 100">
    <g>
      <rect width="100%" height="100%" fill="#FFFFFF"></rect>
        <g transform="translate(50 50) rotate(0) translate(-50 -50)" :fill="cubeColor">
        <svg :fill="cubeColor" xmlns="http://www.w3.org/2000/svg" data-name="레이어 1" viewBox="0 0 80 80" x="0px" y="0px">
        <title>Icon_Templete_jimyung</title>
        <rect x="20.36" y="37.1" width="42.42" height="42.42"></rect>
        <polygon points="63.79 78.83 79.6 63.19 79.6 21.17 63.79 36.81 63.79 78.83"></polygon>
        <polygon points="78.88 20.47 38.9 20.47 21.18 36.1 63.08 36.1 70.14 29.12 78.88 20.47"></polygon>
        </svg>
      </g>
    </g>
  </svg>
</template>
<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'StoryIconSpeed',
  props: ['id'],
  computed: {
    ...mapGetters({
      allSpaces: 'models/allSpaces',
    }),
    ...mapState({
      projectSpaceTypes: state => state.models.library.space_types,
    }),
    cubeColor() {
      const space = this.allSpaces.find(aSpace => aSpace.id === this.id);
      if (!space) return '#BEBEBE';
      if (space.space_type_id) {
        const type = this.projectSpaceTypes.find(aType => aType.id === space.space_type_id);
        return type.color;
      }
      return space.color;
    },
  },
};
</script>
<style>
#space-cube {
  max-width: 25px;
  max-height: 25px;
  padding-right: 2%;
}
</style>

