import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

export class StlViewer {
  constructor(containerElement, options = {}) {
    this.container = containerElement
    this.width = containerElement.clientWidth
    this.height = containerElement.clientHeight

    // Scene setup
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(options.backgroundColor || 0xfafafa)

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
    this.camera.position.set(0, 0, 100)

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(this.renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(100, 100, 50)
    this.scene.add(directionalLight)

    // Controls
    this.controls = {
      isRotating: false,
      previousMousePosition: { x: 0, y: 0 }
    }

    this.mesh = null
    this.loader = new STLLoader()

    // Bind events
    this._setupEventListeners()

    // Start animation loop
    this._animate()

    // Handle window resize
    window.addEventListener('resize', () => this._onWindowResize())
  }

  async loadFromUrl(url) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (geometry) => {
          this._addGeometry(geometry)
          resolve()
        },
        undefined,
        (error) => reject(error)
      )
    })
  }

  _addGeometry(geometry) {
    // Remove existing mesh
    if (this.mesh) {
      this.scene.remove(this.mesh)
    }

    // Compute bounds
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox
    const size = new THREE.Vector3()
    bbox.getSize(size)

    // Center geometry
    geometry.translate(-size.x / 2, -size.y / 2, -size.z / 2)

    // Material and mesh
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      specular: 0x111111,
      shininess: 100
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)

    // Auto-fit camera
    this._fitCameraToObject()
  }

  _fitCameraToObject() {
    if (!this.mesh) return

    const bbox = new THREE.Box3().setFromObject(this.mesh)
    const size = bbox.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = this.camera.fov * (Math.PI / 180)
    let cameraZ = maxDim / 2 / Math.tan(fov / 2)

    this.camera.position.z = cameraZ * 1.3
    this.camera.lookAt(this.mesh.position)
  }

  _setupEventListeners() {
    this.renderer.domElement.addEventListener('mousedown', (e) => this._onMouseDown(e))
    this.renderer.domElement.addEventListener('mousemove', (e) => this._onMouseMove(e))
    this.renderer.domElement.addEventListener('mouseup', (e) => this._onMouseUp(e))
    this.renderer.domElement.addEventListener('wheel', (e) => this._onMouseWheel(e), false)
    this.renderer.domElement.addEventListener('touchstart', (e) => this._onTouchStart(e))
    this.renderer.domElement.addEventListener('touchmove', (e) => this._onTouchMove(e))
  }

  _onMouseDown(e) {
    this.controls.isRotating = true
    this.controls.previousMousePosition = { x: e.clientX, y: e.clientY }
  }

  _onMouseMove(e) {
    if (this.controls.isRotating && this.mesh) {
      const deltaX = e.clientX - this.controls.previousMousePosition.x
      const deltaY = e.clientY - this.controls.previousMousePosition.y

      this.mesh.rotation.y += deltaX * 0.005
      this.mesh.rotation.x += deltaY * 0.005

      this.controls.previousMousePosition = { x: e.clientX, y: e.clientY }
    }
  }

  _onMouseUp(e) {
    this.controls.isRotating = false
  }

  _onMouseWheel(e) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1.05 : 0.95
    this.camera.position.multiplyScalar(delta)
  }

  _onTouchStart(e) {
    if (e.touches.length === 2) {
      this.controls.previousMousePosition = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      }
      this.controls.touchDistance = this._getTouchDistance(e)
    } else if (e.touches.length === 1) {
      this.controls.isRotating = true
      this.controls.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }
  }

  _onTouchMove(e) {
    e.preventDefault()
    if (e.touches.length === 2) {
      const newDistance = this._getTouchDistance(e)
      const delta = newDistance / this.controls.touchDistance
      this.camera.position.multiplyScalar(1 / delta)
      this.controls.touchDistance = newDistance
    } else if (e.touches.length === 1 && this.controls.isRotating && this.mesh) {
      const deltaX = e.touches[0].clientX - this.controls.previousMousePosition.x
      const deltaY = e.touches[0].clientY - this.controls.previousMousePosition.y

      this.mesh.rotation.y += deltaX * 0.005
      this.mesh.rotation.x += deltaY * 0.005

      this.controls.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }
  }

  _getTouchDistance(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  _animate() {
    requestAnimationFrame(() => this._animate())
    this.renderer.render(this.scene, this.camera)
  }

  _onWindowResize() {
    this.width = this.container.clientWidth
    this.height = this.container.clientHeight

    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
  }

  /**
   * Capture current canvas as image blob
   * @param {string} format - 'png' or 'jpeg'
   * @returns {Promise<Blob>}
   */
  captureScreenshot(format = 'png') {
    return new Promise((resolve) => {
      this.renderer.render(this.scene, this.camera)
      this.renderer.domElement.toBlob((blob) => {
        resolve(blob)
      }, `image/${format}`)
    })
  }

  /**
   * Reset camera view
   */
  resetView() {
    this._fitCameraToObject()
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.renderer.dispose()
    if (this.mesh) {
      this.mesh.geometry.dispose()
      this.mesh.material.dispose()
    }
    this.container.removeChild(this.renderer.domElement)
  }
}
