///<reference path="../definitions/three.d.ts"/>

class Boid extends THREE.LineSegments {
    public geometry: THREE.ConeBufferGeometry;
    private edge: THREE.EdgesGeometry;
    private visibility: number;
    private weight: number;
    private direction: THREE.Vector3;

    constructor(weight: number) {
        var geometry = new THREE.ConeBufferGeometry(2, 7, 3);
        var edges = new THREE.EdgesGeometry(geometry, 0);
        edges.applyMatrix(new THREE.Matrix4().makeTranslation(0, -1, 0));
        edges.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        super(edges, new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 4,
        }));
        this.position.x = -200;
        this.position.y = 25;
        this.position.z = 200;
        this.direction = new THREE.Vector3(1, 0, -1);
        this.weight = weight;
        this.visibility = 5;
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
        this.direction.divideScalar(total)
        this.direction.multiplyScalar(this.weight + 1);
    }

    private alignment(boids: Boid[]) {
        let neighbours = 0;
        let vel_x = 0;
        let vel_y = 0;
        let vel_z = 0;
        for (var i = 0; i < boids.length; i++) {
            if (boids[i] !== this) {
                if (boids[i].isVisible(boids[i])) {
                    vel_x += boids[i].direction.x;
                    vel_y += boids[i].direction.y;
                    vel_z += boids[i].direction.z;
                    neighbours++;
                }
            }
        }
        if (neighbours) {
            this.direction.x += (vel_x / neighbours)
            this.direction.y += (vel_y / neighbours)
            this.direction.z += (vel_z / neighbours)
        }
    }

    private isVisible(boid: Boid) {
        console.log(boid.position.x)
        console.log(this.position.x)
        return Math.abs(boid.position.x - this.position.x) < this.visibility &&
            Math.abs(boid.position.y - this.position.y) < this.visibility &&
            Math.abs(boid.position.z - this.position.z) < this.visibility
    }

    public fly(boids: Boid[]) {
        this.direction.x += (Math.random() - 0.5) / (this.weight * 50);
        this.direction.y += (Math.random() - 0.5) / (this.weight * 50);
        this.direction.z += (Math.random() - 0.5) / (this.weight * 50);
        this.position.x += this.direction.x;
        this.position.y += this.direction.y;
        this.position.z += this.direction.z;

        if (this.position.x < -250 ||
            this.position.x > 250) {
            this.direction.x = -this.direction.x;
        }
        if (this.position.y < -100 ||
            this.position.y > 100) {
            this.direction.y = -this.direction.y;
        }
        if (this.position.z < -250 ||
            this.position.z > 250) {
            this.direction.z = -this.direction.z;
        }

        this.alignment(boids)
        this.normalize();
        this.alignWithVelocityVector();
    }
}