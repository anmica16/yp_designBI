<template>
  <DimTypeTag
    :class="[{ dragging }, Dim.dimClass]"
    :type="Dim.type"
    :name="Dim.key"
    :preText="Dim.preText"
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
