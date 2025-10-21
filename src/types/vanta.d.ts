declare module "vanta/dist/vanta.net.min" {
  import type { VantaBase } from "../../node_modules/vanta/dist/vanta.base";
  const plugin: (options: any) => VantaBase;
  export default plugin;
}
