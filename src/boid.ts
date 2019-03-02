///<reference path="../definitions/three.d.ts"/>

class Boid extends THREE.LineSegments {
    private visibility: number;
    private weight: number;
    private direction: THREE.Vector3;
    private neighbours: Boid[];

    constructor() {
        var geometry = new THREE.ConeBufferGeometry(3, 8, 3);
        var edges = new THREE.EdgesGeometry(geometry, 0);
        edges.applyMatrix(new THREE.Matrix4().makeTranslation(0, -1, 0));
        edges.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        super(edges, new THREE.LineBasicMaterial());
        this.position.x = -150;
        this.position.y = 30;
        this.position.z = 150;
        this.direction = new THREE.Vector3(1 + this.weight, 0, -1 + this.weight);
        this.weight = Math.random();
        this.visibility = 50;
    }

    private alignWithVelocityVector(): void {
        const alignment = new THREE.Vector3().addVectors(this.direction, this.position);
        this.lookAt(alignment);
    }

    private normalize() {
        const total: number = Math.max(
            Math.abs(this.direction.x),
            Math.abs(this.direction.z),
            Math.abs(this.direction.y));
        this.direction.divideScalar(total);
    }

    public setNeighbours(boids: Boid[]) {
        this.neighbours = [];
        for (var i = 0; i < boids.length; i++) {
            if (boids[i] !== this) {
                if (this.isVisible(boids[i])) {
                    this.neighbours.push(boids[i]);
                }
            }
        }
    }

    private alignment() {
        let vel_x = 0;
        let vel_y = 0;
        let vel_z = 0;
        for (var i = 0; i < this.neighbours.length; i++) {
            vel_x += this.neighbours[i].direction.x;
            vel_y += this.neighbours[i].direction.y;
            vel_z += this.neighbours[i].direction.z;
        }
        // Based on visibility the boids will react according to a weighted reaction time
        if (this.neighbours.length) {
            this.direction.x += (vel_x / this.neighbours.length) / (this.weight / 0.1);
            this.direction.y += (vel_y / this.neighbours.length) / (this.weight / 0.1);
            this.direction.z += (vel_z / this.neighbours.length) / (this.weight / 0.1);
        }
    }

    private isVisible(boid: Boid) {
        // Naive distance calculator, currently a cube
        return Math.abs(boid.position.x - this.position.x) < this.visibility &&
            Math.abs(boid.position.y - this.position.y) < this.visibility &&
            Math.abs(boid.position.z - this.position.z) < this.visibility
    }

    public fly() {
        this.direction.x += (Math.random() - 0.5) / (this.weight / 0.01)
        this.direction.y += (Math.random() - 0.5) / (this.weight / 0.01)
        this.direction.z += (Math.random() - 0.5) / (this.weight / 0.01)
        this.position.x += this.direction.x;
        this.position.y += this.direction.y;
        this.position.z += this.direction.z;

        // Stops boidw flying out of zone
        // @todo replace with object avoidance
        if (this.position.x < -250 ||
            this.position.x > 250) {
            this.direction.x = -this.direction.x;
        }
        if (this.position.y < -100 ||
            this.position.y > 150) {
            this.direction.y = -this.direction.y;
        }
        if (this.position.z < -250 ||
            this.position.z > 250) {
            this.direction.z = -this.direction.z;
        }
        this.alignment();
        this.normalize();
        this.alignWithVelocityVector();
    }
}