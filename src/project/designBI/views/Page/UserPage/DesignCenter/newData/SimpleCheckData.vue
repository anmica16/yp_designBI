<template>
  <DimTable :data="getStrDateAoa(keySheet)" :dimension="dimension"></DimTable>
</template>

<script>
import X from "@designBI/views/mixins/X";
import { Xplus } from "@designBI/views/mixins/X";
export default {
  name: "SimpleCheckData",
  mixins: [X, Xplus]
};
</script>
