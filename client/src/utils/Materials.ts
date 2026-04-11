import * as THREE from 'three'

// textures
import iridescentPath from '@/assets/matcaps/iridecent_mat_512.png'
import diamondPath from '@/assets/matcaps/diamond.jpeg'
import normalLightPath from '@/assets/matcaps/normal-light.png'
import normalBluePath from '@/assets/matcaps/normal-blue.png'
import mutedMaroonPath from '@/assets/matcaps/muted-maroon.jpg'
import softFleshPath from '@/assets/matcaps/soft-flesh.jpg'
import studioDefaultPath from '@/assets/matcaps/studio-default.png'
import studioBlackPath from '@/assets/matcaps/studio-black.png'
import studioBluePath from '@/assets/matcaps/studio-blue.png'
import studioBlushPath from '@/assets/matcaps/studio-blush.png'
import studioBlushWetPath from '@/assets/matcaps/studio-blush-wet.png'
import studioBrownClayPath from '@/assets/matcaps/studio-brown-clay.png'
import studioChromePath from '@/assets/matcaps/studio-chrome.png'
import studioDaisyPath from '@/assets/matcaps/studio-daisy.png'
import studioFlatClayPath from '@/assets/matcaps/studio-flat-clay.png'
import studioFlatGreyPath from '@/assets/matcaps/studio-flat-grey.png'
import studioFleshPath from '@/assets/matcaps/studio-flesh.png'
import studioGlassPath from '@/assets/matcaps/studio-glass.png'
import studioGlassGreenPath from '@/assets/matcaps/studio-glass-green.png'
import studioGlassRedPath from '@/assets/matcaps/studio-glass-red.png'
import studioGlassTealPath from '@/assets/matcaps/studio-glass-teal.png'
import studioGlowPurplePath from '@/assets/matcaps/studio-glow-purple.png'
import studioGoldPath from '@/assets/matcaps/studio-gold.png'
import studioIndigoPath from '@/assets/matcaps/studio-indigo.png'
import studioLilacPath from '@/assets/matcaps/studio-lilac.png'
import studioMaroonPath from '@/assets/matcaps/studio-maroon.png'
import studioPeachPath from '@/assets/matcaps/studio-peach.png'
import studioRedClayPath from '@/assets/matcaps/studio-red-clay.png'
import studioSelectedPath from '@/assets/matcaps/studio-selected.png'
import studioSlatePath from '@/assets/matcaps/studio-slate.png'
import studioToxicPath from '@/assets/matcaps/studio-toxic.png'
import studioWarmClayPath from '@/assets/matcaps/studio-warm-clay.png'
import studioYellowPath from '@/assets/matcaps/studio-yellow.png'
import studioBrightFlesh from '@/assets/matcaps/studio-bright-flesh.png'
import studioSeaGreen from '@/assets/matcaps/studio-sea-green.png'
import studioBubblegumPath from '@/assets/matcaps/studio-bubblegum.png'
import studioClayRedPath from '@/assets/matcaps/studio-clay-red.png'
import studioClayPath from '@/assets/matcaps/studio-clay.png'
import studioDeepRedPath from '@/assets/matcaps/studio-deep-red.png'
import studioFlatRedPath from '@/assets/matcaps/studio-flat-red.png'
import studioFleshPalePath from '@/assets/matcaps/studio-flesh-pale.png'
import studioFleshSoftPath from '@/assets/matcaps/studio-flesh-soft.png'
import studioGreenPath from '@/assets/matcaps/studio-green.png'
import studioGreyPath from '@/assets/matcaps/studio-grey.png'
import studioHotPinkPath from '@/assets/matcaps/studio-hot-pink.png'
import studioMatteBlue from '@/assets/matcaps/studio-matte-blue.png'
import studioMatteGreen from '@/assets/matcaps/studio-matte-green.png'
import studioTealPath from '@/assets/matcaps/studio-teal.png'
import studioUnderRedPath from '@/assets/matcaps/studio-under-red.png'
import { extend } from '@tresjs/core'
import { preview } from 'vite'
import { logger } from './Logger'

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

export const MATERIAL_REGISTRY = {

}

const materials = [
  // Core & Reference
  { name: 'Studio Default', src: studioDefaultPath },
  { name: 'Studio Selected', src: studioSelectedPath },

  // Normals
  { name: 'Normal Light', src: normalLightPath },
  { name: 'Normal Blue', src: normalBluePath },

  // Flesh & Skin Tones
  { name: 'Soft Flesh', src: softFleshPath },
  { name: 'Studio Flesh', src: studioFleshPath },
  { name: 'Studio Flesh Soft', src: studioFleshSoftPath },
  { name: 'Studio Flesh Pale', src: studioFleshPalePath },
  { name: 'Bright Flesh', src: studioBrightFlesh },
  { name: 'Studio Blush', src: studioBlushPath },
  { name: 'Studio Blush Wet', src: studioBlushWetPath },

  // Clay Variants
  { name: 'Studio Clay', src: studioClayPath },
  { name: 'Studio Flat Clay', src: studioFlatClayPath },
  { name: 'Studio Red Clay', src: studioRedClayPath },
  { name: 'Studio Clay Red', src: studioClayRedPath },
  { name: 'Studio Brown Clay', src: studioBrownClayPath },
  { name: 'Studio Warm Clay', src: studioWarmClayPath },

  // Flat & Matte
  { name: 'Studio Flat Grey', src: studioFlatGreyPath },
  { name: 'Studio Flat Red', src: studioFlatRedPath },
  { name: 'Studio Matte Blue', src: studioMatteBlue },
  { name: 'Studio Matte Green', src: studioMatteGreen },

  // Color Palettes
  { name: 'Studio Black', src: studioBlackPath },
  { name: 'Studio Blue', src: studioBluePath },
  { name: 'Studio Green', src: studioGreenPath },
  { name: 'Studio Grey', src: studioGreyPath },
  { name: 'Studio Teal', src: studioTealPath },
  { name: 'Studio Peach', src: studioPeachPath },
  { name: 'Studio Yellow', src: studioYellowPath },
  { name: 'Studio Lilac', src: studioLilacPath },
  { name: 'Studio Indigo', src: studioIndigoPath },
  { name: 'Studio Maroon', src: studioMaroonPath },
  { name: 'Muted Maroon', src: mutedMaroonPath },
  { name: 'Studio Deep Red', src: studioDeepRedPath },
  { name: 'Studio Under Red', src: studioUnderRedPath },
  { name: 'Studio Hot Pink', src: studioHotPinkPath },
  { name: 'Studio Bubblegum', src: studioBubblegumPath },
  { name: 'Sea Green', src: studioSeaGreen },
  { name: 'Studio Slate', src: studioSlatePath },
  { name: 'Studio Daisy', src: studioDaisyPath },

  // Glass
  { name: 'Studio Glass', src: studioGlassPath },
  { name: 'Studio Glass Green', src: studioGlassGreenPath },
  { name: 'Studio Glass Red', src: studioGlassRedPath },
  { name: 'Studio Glass Teal', src: studioGlassTealPath },

  // Metallic & Reflective
  { name: 'Studio Chrome', src: studioChromePath },
  { name: 'Steel', src: studioChromePath },
  { name: 'Studio Gold', src: studioGoldPath },

  // Special Effects
  { name: 'Studio Glow Purple', src: studioGlowPurplePath },
  { name: 'Studio Toxic', src: studioToxicPath },

  // Specialty
  { name: 'Iridescent', src: iridescentPath },
  { name: 'Diamond', src: diamondPath },
]

materials.forEach(material => {
  let key = 'Mesh' + material.name.replaceAll(' ', '') + 'Material'
  MATERIAL_REGISTRY[material.name] = {
    component: key,
    preview: material.src
  }
  extend({ [key]: createMatcapMaterial(material.src) })
})

logger.log('MATERIALS', MATERIAL_REGISTRY)