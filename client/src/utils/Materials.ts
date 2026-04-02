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
import goobertPurplePath from '@/assets/matcaps/goobert_purple_mat.png'
import normalLighterPath from '@/assets/matcaps/normal_lighter_mat_512.png'
import normalNegativePath from '@/assets/matcaps/normal_negative_mat_512.png'
import purplePath from '@/assets/matcaps/purple_mat_512.png'
import waterPath from '@/assets/matcaps/water_mat.png'
import lilacPath from '@/assets/matcaps/lilac_mat.png'
import diamondPath from '@/assets/matcaps/diamond_mat.png'
import metalPath from '@/assets/matcaps/brushed_metal_mat.png'
import bubblePath from '@/assets/matcaps/bubble_mat.png'
import innerPurpleGlowPath from '@/assets/matcaps/purple_inner_glow.png'
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
export const MeshGoobertPurpleMaterial = createMatcapMaterial(goobertPurplePath)
export const MeshNormalLighterMaterial = createMatcapMaterial(normalLighterPath)
export const MeshNormalNegativeMaterial = createMatcapMaterial(normalNegativePath)
export const MeshPurpleMaterial = createMatcapMaterial(purplePath)
export const MeshWaterMaterial = createMatcapMaterial(waterPath)
export const MeshLilacMaterial = createMatcapMaterial(lilacPath)
export const MeshDiamondMaterial = createMatcapMaterial(diamondPath)
export const MeshBrushedMetalMaterial = createMatcapMaterial(metalPath)
export const MeshBubbleMaterial = createMatcapMaterial(bubblePath)
export const MeshPurpleInnerGlowMaterial = createMatcapMaterial(innerPurpleGlowPath)

// Standard materials — react to scene lights
function createStandardMaterial(options: THREE.MeshStandardMaterialParameters) {
  return class extends THREE.MeshStandardMaterial {
    constructor() {
      super(options)
    }
  }
}

export const MeshSteelMaterial = createStandardMaterial({ color: 0xccccdd, roughness: 0.25, metalness: 0.85 })
export const MeshPlasticMaterial = createStandardMaterial({ color: 0x8888ff, roughness: 0.6, metalness: 0.0 })
export const MeshSelectedMaterial = createStandardMaterial({ color: 0x44aaff, roughness: 0.4, metalness: 0.3, emissive: 0x112244 })

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
  MeshGoobertPurpleMaterial,
  MeshPurpleMaterial,
  MeshWaterMaterial,
  MeshPlasticMaterial,
  MeshLilacMaterial,
  MeshDiamondMaterial,
  MeshBrushedMetalMaterial,
  MeshBubbleMaterial,
  MeshPurpleInnerGlowMaterial
})