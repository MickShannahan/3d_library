declare module "*.vue" {
  import Vue from 'vue';
  export default Vue.defineComponent();
}

declare module "*.stl" {
  const src: string;
  export default src;
}
