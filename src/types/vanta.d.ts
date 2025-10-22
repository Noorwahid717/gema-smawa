declare module "vanta/dist/vanta.net.min" {
  import type { VantaBase } from "../../node_modules/vanta/dist/vanta.base";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugin: (options: any) => VantaBase;
  export default plugin;
}
