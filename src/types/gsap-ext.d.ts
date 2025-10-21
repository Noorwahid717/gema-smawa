import type gsap from "gsap";

declare global {
  type GsapGlobal = typeof gsap;
  type GsapContext = ReturnType<GsapGlobal["context"]>;
  type GsapTween = ReturnType<GsapGlobal["to"]>;
}
export {}; 
