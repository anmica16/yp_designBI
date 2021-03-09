<template>
  <div class="CoatingDim" :class="{ active: isActive }">
    <template v-for="candy in candies">
      <CandyDimTag
        :class="candyCls"
        :ref="candy.$id"
        :key="candy.$id"
        :Dim="candy"
        :candyMaster="candyMaster"
        :dimXtype="dimXtype"
      >
      </CandyDimTag>
    </template>
  </div>
</template>

<script>
import { Coating } from "@designBI/views/component/dropCandy";
import CandyDimTag from "./CandyDimTag";
export default {
  name: "CoatingDim",
  mixins: [Coating],
  components: { CandyDimTag },
  props: {
    candyCls: {
      type: String,
      default() {
        return "edit";
      }
    },
    dimXtype: {
      type: String,
      default: "span"
    }
  }
};
</script>

<style lang="scss">
.CoatingDim {
  border: 1px solid #e8eaed;
  min-height: 36px;
  cursor: text;
  &.active {
    border: 1px solid rgb(53, 129, 228);
    box-shadow: 0 0 0 2px rgba(69, 144, 236, 0.15);
  }
}
</style>
