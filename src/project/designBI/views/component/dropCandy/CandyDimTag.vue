<template>
  <DimTypeTag
    :class="[{ dragging }, Dim.dimClass]"
    :type="Dim.type"
    :name="Dim.chineseName || Dim.key"
    :preText="Dim.preText"
    :xtype="dimXtype"
    @mousedown.native.prevent="candyHandleDown"
  ></DimTypeTag>
</template>

<script>
import { Candy } from "@designBI/views/component/dropCandy";
export default {
  name: "CandyDimTag",
  mixins: [Candy],
  props: {
    dimXtype: {
      type: String,
      default: "span"
    }
  }
};
</script>
