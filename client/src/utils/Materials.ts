import * as THREE from 'three'

// textures
import iridescentMatPath from '@/assets/matcaps/iridecent_mat_512.png'
import normalHighlightPath from '@/assets/matcaps/normal_highlight_2_mat_512.png'
import greyRainbowPath from '@/assets/matcaps/custom_6_mat_512.png'
import purpleRainbowPath from '@/assets/matcaps/custom_5_mat_512.png'
import blueGlowPath from '@/assets/matcaps/blue_glow_mat.png'
import custom4Path from '@/assets/matcaps/custom_4_mat_512.png'
import darkGreyPath from '@/assets/matcaps/dark_grey_mat.png'
import darkPurplePath from '@/assets/matcaps/dark_purple_mat.jpg'
import goobertPath from '@/assets/matcaps/goobert_mat.png'
import normalLighterPath from '@/assets/matcaps/normal_lighter_mat_512.png'
import normalNegativePath from '@/assets/matcaps/normal_negative_mat_512.png'
import purplePath from '@/assets/matcaps/purple_mat_512.png'
import waterPath from '@/assets/matcaps/water_mat.png'
import { extend } from '@tresjs/core'

const loader = new THREE.TextureLoader()

function createMatcapMaterial(textureImportPath: string) {
  return class extends THREE.MeshMatcapMaterial {
    constructor() {
      super({
        matcap: loader.load(textureImportPath)
      })
      this.matcap.colorSpace = THREE.SRGBColorSpace
    }
  }
}

export const MeshIridescentMaterial = createMatcapMaterial(iridescentMatPath)
export const MeshNormalHighlightMaterial = createMatcapMaterial(normalHighlightPath)
export const MeshGreyRainboxMaterial = createMatcapMaterial(greyRainbowPath)
export const MeshPurpleRainboxMaterial = createMatcapMaterial(purpleRainbowPath)
export const MeshBlueGlowMaterial = createMatcapMaterial(blueGlowPath)
export const MeshCustom4Material = createMatcapMaterial(custom4Path)
export const MeshDarkGreyMaterial = createMatcapMaterial(darkGreyPath)
export const MeshDarkPurpleMaterial = createMatcapMaterial(darkPurplePath)
export const MeshGoobertMaterial = createMatcapMaterial(goobertPath)
export const MeshNormalLighterMaterial = createMatcapMaterial(normalLighterPath)
export const MeshNormalNegativeMaterial = createMatcapMaterial(normalNegativePath)
export const MeshPurpleMaterial = createMatcapMaterial(purplePath)
export const MeshWaterMaterial = createMatcapMaterial(waterPath)

extend({
  MeshIridescentMaterial,
  MeshNormalHighlightMaterial,
  MeshGreyRainboxMaterial,
  MeshPurpleRainboxMaterial,
  MeshBlueGlowMaterial,
  MeshCustom4Material,
  MeshDarkGreyMaterial,
  MeshDarkPurpleMaterial,
  MeshGoobertMaterial,
  MeshPurpleMaterial,
  MeshWaterMaterial
})