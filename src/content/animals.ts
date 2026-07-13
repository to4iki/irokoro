import bearUrl from "../assets/animals/bear.png";
import birdUrl from "../assets/animals/bird.png";
import catUrl from "../assets/animals/cat.png";
import chickUrl from "../assets/animals/chick.png";
import cowUrl from "../assets/animals/cow.png";
import dogUrl from "../assets/animals/dog.png";
import elephantUrl from "../assets/animals/elephant.png";
import frogUrl from "../assets/animals/frog.png";
import horseUrl from "../assets/animals/horse.png";
import lionUrl from "../assets/animals/lion.png";
import monkeyUrl from "../assets/animals/monkey.png";
import penguinUrl from "../assets/animals/penguin.png";
import pigUrl from "../assets/animals/pig.png";
import rabbitUrl from "../assets/animals/rabbit.png";
import sheepUrl from "../assets/animals/sheep.png";
import turtleUrl from "../assets/animals/turtle.png";

/** Irasutoya PNGs bundled for the animals pack (≤20 commercial free quota). */
export const ANIMALS = [
  { id: "dog", label: "わんわん", src: dogUrl },
  { id: "cat", label: "にゃーにゃー", src: catUrl },
  { id: "rabbit", label: "うさぎ", src: rabbitUrl },
  { id: "bird", label: "ことり", src: birdUrl },
  { id: "bear", label: "くま", src: bearUrl },
  { id: "elephant", label: "ぞう", src: elephantUrl },
  { id: "lion", label: "らいおん", src: lionUrl },
  { id: "frog", label: "かえる", src: frogUrl },
  { id: "pig", label: "ぶた", src: pigUrl },
  { id: "cow", label: "うし", src: cowUrl },
  { id: "horse", label: "うま", src: horseUrl },
  { id: "sheep", label: "ひつじ", src: sheepUrl },
  { id: "monkey", label: "さる", src: monkeyUrl },
  { id: "penguin", label: "ペンギン", src: penguinUrl },
  { id: "chick", label: "ひよこ", src: chickUrl },
  { id: "turtle", label: "かめ", src: turtleUrl },
] as const;

export type AnimalId = (typeof ANIMALS)[number]["id"];

const animalById = new Map(ANIMALS.map((animal) => [animal.id, animal]));

export function getAnimal(id: AnimalId) {
  const animal = animalById.get(id);
  if (!animal) {
    throw new RangeError(`Unknown animal: ${id}`);
  }
  return animal;
}
