///<reference path="../definitions/three.d.ts"/>

class Boid extends THREE.LineSegments {
    public visibility: number;
    private mass: number;
    private acceleration: THREE.Vector3;
    public velocity: THREE.Vector3;
    private speed: number;
    private maxSpeed: number;

    constructor() {
        var geometry = new THREE.ConeBufferGeometry(3, 8, 3);
        var edges = new THREE.EdgesGeometry(geometry, 0);
        edges.applyMatrix(new THREE.Matrix4().makeTranslation(0, -1, 0));
        edges.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        super(edges, new THREE.LineBasicMaterial());
        this.mass = 1 + Math.random();
        this.scale.set(this.mass / 1.5, this.mass / 1.5, this.mass / 1.5);
        this.position.x = -300;
        this.position.y = Math.random() * 30;
        this.position.z = 150;
        this.velocity = new THREE.Vector3(1, (Math.random() - 0.5), (Math.random() - 0.5) * 2);
        this.visibility = 60 + (10 * this.mass)
        this.speed = 3 - this.mass;
        this.maxSpeed = 5 - this.mass;
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
            if (distance < (80 + (10 * this.mass))) {
                const offset = new THREE.Vector3(this.position.x, this.position.y, this.position.z).sub(obstacles[i]);
                force.add(offset.divideScalar(distance));
            }
        }
        // Based on visibility the boids will react according to a massed reaction time
        return force.multiplyScalar(this.mass * 0.015)
    }

    public fly(neighbours: Boid[], forces: any, obstacles: THREE.Vector3[]) {
        let force = new THREE.Vector3(0, 0, 0);

        force.add(this.alignment(neighbours, forces.a));
        force.add(this.cohesion(neighbours, forces.c));
        force.add(this.separation(neighbours, forces.s));
        force.add(this.avoidObstacles(obstacles, forces.s));

        this.acceleration = force.divideScalar(this.mass);
    }

    public update() {
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(this.speed, this.maxSpeed);

        this.position.add(this.velocity);
        this.acceleration = new THREE.Vector3();

        //   Stop the boids leaving the visualisation if they don't avoid edges fast enough
        if (this.position.y < -149 ||
            this.position.y > 149) {
            this.velocity.y = -this.velocity.y;
        }
        if (this.position.x < -349 ||
            this.position.x > 349) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.z < -349 ||
            this.position.z > 349) {
            this.velocity.z = -this.velocity.z;
        }

        this.alignWithVelocityVector();
    }
}