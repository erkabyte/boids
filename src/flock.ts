class Flock {
  public flock: Boid[];
  public size: number;
  public max: number;
  private distance: number;
  private distanceSquared: number;

  constructor(scene: THREE.Scene, initialSize: number, maxSize: number) {
    this.flock = [];
    this.max = maxSize;
    this.populate(scene, initialSize);
    this.distance = 20;
    this.distanceSquared = Math.pow(this.distance, 2);
  }

  private setSize() {
    this.size = this.flock.length;
  }

  private populate(scene: THREE.Scene, size: number): void {
    for (let i = 0; i < size; i++) {
      this.addBoid(scene);
    }
  }

  public addBoid(scene: THREE.Scene) {
    const boid = new Boid();
    this.flock.push(boid);
    this.setSize();
    scene.add(boid);
  }

  public updateFlock() {
    for (let i = 0; i < this.size; i++) {
      var neighbors = [];
      //  Iterates through all other boids to find neighbors.
      for (var j = 0; j < this.size; j++) {
        if (j != i) {
          var squareDistance = Math.pow(this.flock[j].position.x - this.flock[i].position.x, 2)
            + Math.pow(this.flock[j].position.y - this.flock[i].position.y, 2);

          if (squareDistance < this.distanceSquared) {
            neighbors.push(this.flock[j]);
          }
        }
      }
      this.flock[i].fly(neighbors);
    }
  }
}
