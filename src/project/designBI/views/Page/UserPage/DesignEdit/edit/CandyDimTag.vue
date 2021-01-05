<template>
  <DimTypeTag
    :class="{ dragging }"
    :type="Dim.type"
    :name="Dim.name"
    @mousedown.native.prevent="candyHandleDown"
  ></DimTypeTag>
</template>

<script>
import { Candy } from "@designBI/views/component/dropCandy";
export default {
  name: "CandyDimTag",
  mixins: [Candy]
};
</script>

<style></style>
