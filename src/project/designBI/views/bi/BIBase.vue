<template>
  <div>BIBase</div>
</template>

<script>
import { Instance } from "../mixins/Entity";

import X from "@designBI/views/mixins/X";
import { Xplus } from "@designBI/views/mixins/X";
//【1】要求必有 数据
export default {
  name: "BIBase",
  mixins: [Instance, X, Xplus]
};
</script>
