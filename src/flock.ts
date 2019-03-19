class Flock {
  public flock: Boid[];
  public size: number;
  public max: number;
  public forces: any;
  public cohesionForce: number;
  public alignmentForce: number;

  constructor(scene: THREE.Scene, initialSize: number, maxSize: number) {
    this.flock = [];
    this.max = maxSize;
    this.populate(scene, initialSize);
    this.forces = { a: 0.1, c: 1 / 15, s: 2 };
  }

  private setSize() {
    this.size = this.flock.length;
  }

  private populate(scene: THREE.Scene, size: number): void {
    for (let i = 0; i < size; i++) {
      setTimeout(() => {
        this.addBoid(scene);
      }, 50 * i)
    }
  }

  public updateForces(a: number, c: number, s: number) {
    this.forces.a = a;
    this.forces.c = c;
    this.forces.s = s;
  }

  public addBoid(scene: THREE.Scene) {
    const boid = new Boid();
    this.flock.push(boid);
    this.setSize();
    scene.add(boid);
  }

  public updateFlock(obstacles: THREE.Vector3[]) {
    for (let i = 0; i < this.size; i++) {
      var neighbors = [];
      //  Iterates through all other boids to find neighbors.
      for (var j = 0; j < this.size; j++) {
        if (j != i) {
          var squareDistance = Math.pow(this.flock[j].position.x - this.flock[i].position.x, 2)
            + Math.pow(this.flock[j].position.y - this.flock[i].position.y, 2)
            + Math.pow(this.flock[j].position.z - this.flock[i].position.z, 2);

          if (squareDistance < Math.pow(this.flock[i].visibility, 2)) {
            neighbors.push(this.flock[j]);
          }
        }
      }
      this.flock[i].fly(neighbors, this.forces, obstacles);
    }
    for (let i = 0; i < this.size; i++) {
      this.flock[i].update();
    }
  }
}
