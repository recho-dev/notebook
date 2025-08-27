import {generate} from "short-uuid";
import {predicates, objects} from "friendly-words";

const FILE_NAME = "obs-files";

function generateProjectName() {
  const adj = predicates[~~(Math.random() * predicates.length)];
  const obj = objects[~~(Math.random() * objects.length)];
  return `${adj} ${obj}`;
}

export function createSketch() {
  return {
    id: generate(),
    title: generateProjectName(),
    createdAt: null,
    updatedAt: null,
    content: `echo("Hello, world!");`,
  };
}

function saveSketches(sketches) {
  localStorage.setItem(FILE_NAME, JSON.stringify(sketches));
}

export function getSketches() {
  const files = localStorage.getItem(FILE_NAME);
  if (!files) return [];
  return JSON.parse(files).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function clearSketchesFromLocalStorage() {
  localStorage.removeItem(FILE_NAME);
}

export function getSketchById(id) {
  const sketches = getSketches();
  return sketches.find((f) => f.id === id);
}

export function deleteSketch(id) {
  if (confirm("Are you sure you want to delete this sketch?")) {
    const sketches = getSketches();
    const newSketches = sketches.filter((f) => f.id !== id);
    saveSketches(newSketches);
  }
}

export function addSketch(sketch) {
  const sketches = getSketches();
  const time = new Date().toISOString();
  const newSketch = {...sketch, createdAt: time, updatedAt: time};
  saveSketches([...sketches, newSketch]);
}

export function saveSketch(sketch) {
  const sketches = getSketches();
  const updatedSketch = {...sketch, updatedAt: new Date().toISOString()};
  const newSketches = sketches.map((f) => (f.id === sketch.id ? updatedSketch : f));
  saveSketches(newSketches);
}
