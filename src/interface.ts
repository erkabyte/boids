import { Vector3 } from "three";

interface IBoid extends THREE.LineSegments {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    visibility: number;
    fly:(neighbours: IBoid[], forces: any, obstacles: Vector3[])=>void
    update: ()=> void
}