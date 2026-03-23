import * as THREE from 'three'

// textures
import iridescentMatPath from '@/assets/matcaps/iridecent_mat_512.png'
import normalHighlightPath from '@/assets/matcaps/normal_highlight_2_mat_512.png'
import greyRainbowPath from '@/assets/matcaps/custom_6_mat_512.png'
import purpleRainbowPath from '@/assets/matcaps/custom_5_mat_512.png'

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