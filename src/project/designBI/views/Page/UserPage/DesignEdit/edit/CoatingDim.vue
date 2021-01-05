<template>
  <div class="CoatingDim">
    <template v-for="candy in candies">
      <CandyDimTag
        :ref="candy.key"
        :key="candy.key"
        :Dim="candy"
        :candyMaster="candyMaster"
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
  components: { CandyDimTag }
};
</script>
