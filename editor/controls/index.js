// import {slider} from "./slider";
import {toggle} from "./toggle";
import {radio} from "./radio";
import {number} from "./number";

export function controls(runtimeRef) {
  return [toggle(runtimeRef), radio(runtimeRef), number(runtimeRef)];
}
