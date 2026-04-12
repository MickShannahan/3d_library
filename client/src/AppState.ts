import { reactive } from "vue";
import { Model } from "./models/Model";
import { PartMesh } from "./models/PartMesh";
import { PartGroup } from "./models/PartGroup";
import { Job } from "./models/Job";
import { Author } from './models/Author'
import { Order } from './models/Order'

interface AppState {
  meshGroups: Model[]
  selectedMeshIds: string[]
  loadedMeshGroups: string[]
  scaleModelsBy: 0,
  draggingMesh: PartMesh
  draggingFromPartGroup: PartGroup | null
  jobs: Job[]
  downloadJobs: Job[]
  models: Model[]
  activeModel: Model
  activeAuthor: Author | null
  activeOrder: Order | null
  authors: Author[],
  tags: string[]
  orders: Order[]
  sasToken: string
}

export const AppState = reactive<AppState>({
  meshGroups: [] as Model[],
  selectedMeshIds: [],
  loadedMeshGroups: [],
  scaleModelsBy: 0,
  draggingMesh: null,
  draggingFromPartGroup: null,
  models: [] as Model[],
  activeModel: null,
  activeAuthor: null,
  activeOrder: null,
  jobs: [] as Job[],
  downloadJobs: [] as Job[],
  tags: ['nintendo', 'monster', 'capcom', 'warhammer 40k', 'warhammer AoS'],
  orders: [] as Order[],
  authors: [
    new Author({
      name: 'Matmire Makes',
      image: 'https://images2.myminifactory.com/insecure/rt:fill-down/w:400/h:400/el:1/plain/https://dl4.myminifactory.com/public-assets/profile-images/3ab5759d3f6f835cd7b804de98baa3e3fd310659.jpg'
    }),
    new Author({
      name: 'Twin Goddess Minis',
      image: 'https://images2.myminifactory.com/insecure/rt:fill-down/w:400/h:400/el:1/plain/https://dl4.myminifactory.com/public-assets/profile-images/e9b100b47258334e198851a0042738d5e25a5580.png'
    }),
    new Author({
      name: 'Imp Prints',
      image: 'https://images2.myminifactory.com/insecure/rt:fill-down/w:400/h:400/el:1/plain/https://dl4.myminifactory.com/public-assets/profile-images/76fc3e396aa74b68661f1a2351581ebf32b5c3d8.png'
    }),
    new Author({
      name: 'Mark Lambert',
      image: 'https://cdn.bsky.app/img/avatar/plain/did:plc:mcpmqreubpvq5ezqwloqonnv/bafkreigdraa472diudda77l5wbftfgff3zr42fhaaozreg7dc2g7puwsom'
    }),
  ],
  sasToken: ''
})