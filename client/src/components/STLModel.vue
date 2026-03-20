<script setup>
import { Mesh, MeshNormalMaterial, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { shallowRef, watch } from 'vue';

const props = defineProps({
  src: String
})
const loader = new STLLoader()
const geometry = shallowRef(null)
const material = new MeshNormalMaterial()

watch(() => props.src, () => {
  if (!props.src) return
  loader.load(props.src, (loadedGeo) => {
    // loadedGeo.computeBoundingBox()
    // const size = loadedGeo.boundingBox.getSize(new Vector3())
    // const maxDim = Math.max(size.x, size.y, size.z)

    // loadedGeo.translate(-size.x / 2, -size.y / 2, -size.z / 2)

    const mesh = new Mesh(loadedGeo, material)
    // mesh.scale.multiplyScalar(10 / maxDim)
    geometry.value = mesh
  })
}, { immediate: true })
</script>

<template>
  <primitive v-if="geometry" :object="geometry" />
</template>

<style lang="scss" scoped></style>