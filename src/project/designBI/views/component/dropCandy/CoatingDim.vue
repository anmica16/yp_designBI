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
