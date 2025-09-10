// import {slider} from "./slider";
import {toggle} from "./toggle";
import {radio} from "./radio";

export function controls(runtimeRef) {
  return [toggle(runtimeRef), radio(runtimeRef)];
}
