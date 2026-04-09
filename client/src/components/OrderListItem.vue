<script setup lang="ts">
import { Order } from '@/models/Order';


const props = defineProps({
  order: {type: Order}
})

</script>


<template>
<div class="d-flex">
{{ order.orderNumber }}
</div>
</template>


<style lang="scss" scoped>

</style>