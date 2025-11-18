import {toggle} from "./toggle";
import {radio} from "./radio";
import {number} from "./number";
import {button} from "./button";

export function controls(runtimeRef) {
  return [toggle(runtimeRef), radio(runtimeRef), number(runtimeRef), button(runtimeRef)];
}
