///<reference path="../definitions/three.d.ts"/>

class Boid extends THREE.LineSegments {
    public visibility: number;
    private mass: number;
    private acceleration: THREE.Vector3;
    public velocity: THREE.Vector3;
    private speed: number;
    private maxSpeed: number;
    private counter: number;

    constructor() {
        var geometry = new THREE.ConeBufferGeometry(3, 8, 3);
        var edges = new THREE.EdgesGeometry(geometry, 0);
        edges.applyMatrix(new THREE.Matrix4().makeTranslation(0, -1, 0));
        edges.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        super(edges, new THREE.LineBasicMaterial());
        this.mass = 1 + Math.random();
        this.position.x = -150;
        this.position.y = Math.random() * 30;
        this.position.z = 150;
        this.counter = Math.random() * 10;
        // this.velocity = new THREE.Vector3(1, 0, (Math.random() - 0.5) * 2);
        this.velocity = new THREE.Vector3(1, (Math.random() - 0.5), (Math.random() - 0.5) * 2);
        this.visibility = 90 + (10 * this.mass)
        this.speed = 3 - this.mass;
        this.maxSpeed = 4 - this.mass;
    }

    private alignWithVelocityVector(): void {
        const alignment = new THREE.Vector3().addVectors(this.velocity, this.position);
        this.lookAt(alignment);
    }


    private alignment(neighbours: Boid[], strength: number) {
        let steering = new THREE.Vector3(0, 0, 0);
        if (neighbours.length === 0) {
            return steering;
        }
        for (var i = 0; i < neighbours.length; i++) {
            steering.add(neighbours[i].velocity);
        }
        // Based on visibility the boids will react according to a massed reaction time
        return steering.divideScalar(neighbours.length)
            .sub(this.velocity)
            .clampLength(0, this.mass * strength);
    }

    private cohesion(neighbours: Boid[], strength: number) {
        let position = new THREE.Vector3(0, 0, 0);
        if (neighbours.length === 0) {
            return position;
        }
        for (var i = 0; i < neighbours.length; i++) {
            position.add(neighbours[i].position);
        }
        // Based on visibility the boids will react according to a massed reaction time
        return position.divideScalar(neighbours.length)
            .sub(this.position)
            .clampLength(0, this.mass * strength);
    }

    private separation(neighbours: Boid[], strength: number) {
        let force = new THREE.Vector3(0, 0, 0);
        if (neighbours.length === 0) {
            return force;
        }
        for (var i = 0; i < neighbours.length; i++) {
            let distance = new THREE.Vector3(this.position.x, this.position.y, this.position.z).distanceTo(neighbours[i].position);
            if (distance < (40 + (10 * this.mass))) {
                const offset = new THREE.Vector3(this.position.x, this.position.y, this.position.z).sub(neighbours[i].position);
                // offset.normalize();
                force.add(offset.divideScalar(distance));
            }
        }
        // Based on visibility the boids will react according to a massed reaction time
        return force.divideScalar(neighbours.length)
            .multiplyScalar(this.mass * strength)
    }

    private avoidObstacles(obstacles: THREE.Vector3[], strength: number) {
        let force = new THREE.Vector3(0, 0, 0);
        for (var i = 0; i < obstacles.length; i++) {
            let distance = new THREE.Vector3(this.position.x, this.position.y, this.position.z).distanceTo(obstacles[i]);
            if (distance < (40 + (10 * this.mass))) {
                const offset = new THREE.Vector3(this.position.x, this.position.y, this.position.z).sub(obstacles[i]);
                // offset.normalize();
                force.add(offset.divideScalar(distance));
            }
        }
        // Based on visibility the boids will react according to a massed reaction time
        return force.multiplyScalar(this.mass * 2)
    }

    private avoidEdges() {
        let position = new THREE.Vector3(0, 0, 0);
        // let distance = new Vector3(this.position.x, this.position.y, this.position.z).distanceTo(neighbours[i].position);
        if (this.position.x > (250 - this.visibility)) {
            position.x = -Math.abs((1 / (100 * this.mass)) * (250 - this.position.x));
        }
        if (this.position.z > (250 - this.visibility)) {
            position.z = -Math.abs((1 / (100 * this.mass)) * (250 - this.position.z));
        }
        if (this.position.y > 80) {
            position.y = - Math.abs((1 / 40) * (100 - this.position.y));
        }
        if (this.position.x < (-250 + this.visibility)) {
            position.x = Math.abs((1 / (100 * this.mass)) * (-250 - this.position.x));
        }
        if (this.position.z < (-250 + this.visibility)) {
            position.z = Math.abs((1 / (100 * this.mass)) * (-250 - this.position.z));
        }
        if (this.position.y < 20) {
            position.y = Math.abs((1 / 40) * (0 - this.position.y));
        }

        // Stop the boids leaving the visualisation if they don't avoid edges fast enough
        if (this.position.y < -150 ||
            this.position.y > 150) {
            this.velocity.y = -this.velocity.y;
        }
        if (this.position.x < -300 ||
            this.position.x > 300) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.z < -300 ||
            this.position.z > 300) {
            this.velocity.z = -this.velocity.z;
        }

        return position
            .multiplyScalar(this.mass / 10);
    }

    public fly(neighbours: Boid[], forces: any, obstacles: THREE.Vector3[]) {
        let force = new THREE.Vector3(0, 0, 0);

        force.add(this.alignment(neighbours, forces.a));
        force.add(this.cohesion(neighbours, forces.c));
        force.add(this.separation(neighbours, forces.s));
        force.add(this.avoidEdges());
        force.add(this.avoidObstacles(obstacles, forces.s));

        this.acceleration = force.divideScalar(this.mass);
    }

    public update() {
        if (this.counter === 10) {
            this.counter = 0;
        }
        this.counter++;
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(this.speed, this.maxSpeed);

        if (Math.random() * 10 > 9.98) {
            this.velocity.add(new THREE.Vector3((Math.random() - 0.5) / 3, (Math.random() - 0.5) / 3, (Math.random() - 0.5) / 3))
        }

        this.position.add(this.velocity);
        this.acceleration = new THREE.Vector3();

        this.alignWithVelocityVector();
    }
}