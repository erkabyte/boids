var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
window.onload = function () {
    var elem = document.getElementById('container');
    elem.innerHTML = "";
    var engine = new Engine(elem, 0xC79EA4);
    setCamera();
    elem.addEventListener('click', function (event) {
        engine.addToFlock();
    });
    window.onresize = function (event) {
        setCamera();
    };
    document.getElementById('align').addEventListener('change', function (event) {
        updateForces();
    });
    document.getElementById('cohesion').addEventListener('change', function (event) {
        updateForces();
    });
    document.getElementById('separate').addEventListener('change', function (event) {
        updateForces();
    });
    function setCamera() {
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / elem.clientHeight, 0.2, 1000);
        camera.position.set(-200, 30, 200);
        camera.rotation.order = 'YZX';
        camera.rotation.y = -Math.PI / 4;
        camera.rotation.order = 'ZXY';
        camera.rotation.z = -Math.PI / 16;
        camera.rotation.order = 'XZY';
        camera.rotation.x = -Math.PI / 16;
        engine.setCamera(camera);
    }
    function updateForces() {
        engine.flock.updateForces(parseFloat(document.getElementById('align').value), parseFloat(document.getElementById('cohesion').value), parseFloat(document.getElementById('separate').value));
    }
    function animate() {
        requestAnimationFrame(animate);
        engine.update();
    }
    animate();
};
var Boid = (function (_super) {
    __extends(Boid, _super);
    function Boid() {
        var _this = this;
        var geometry = new THREE.ConeBufferGeometry(3, 8, 3);
        var edges = new THREE.EdgesGeometry(geometry, 0);
        edges.applyMatrix(new THREE.Matrix4().makeTranslation(0, -1, 0));
        edges.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        _this = _super.call(this, edges, new THREE.LineBasicMaterial()) || this;
        _this.mass = 1 + Math.random();
        _this.scale.set(_this.mass / 1.5, _this.mass / 1.5, _this.mass / 1.5);
        _this.position.x = -300;
        _this.position.y = Math.random() * 30;
        _this.position.z = 150;
        _this.velocity = new THREE.Vector3(1, (Math.random() - 0.5), (Math.random() - 0.5) * 2);
        _this.visibility = 60 + (10 * _this.mass);
        _this.speed = 3 - _this.mass;
        _this.maxSpeed = 5 - _this.mass;
        return _this;
    }
    Boid.prototype.alignWithVelocityVector = function () {
        var alignment = new THREE.Vector3().addVectors(this.velocity, this.position);
        this.lookAt(alignment);
    };
    Boid.prototype.alignment = function (neighbours, strength) {
        var steering = new THREE.Vector3(0, 0, 0);
        if (neighbours.length === 0) {
            return steering;
        }
        for (var i = 0; i < neighbours.length; i++) {
            steering.add(neighbours[i].velocity);
        }
        return steering.divideScalar(neighbours.length)
            .sub(this.velocity)
            .clampLength(0, this.mass * strength);
    };
    Boid.prototype.cohesion = function (neighbours, strength) {
        var position = new THREE.Vector3(0, 0, 0);
        if (neighbours.length === 0) {
            return position;
        }
        for (var i = 0; i < neighbours.length; i++) {
            position.add(neighbours[i].position);
        }
        return position.divideScalar(neighbours.length)
            .sub(this.position)
            .clampLength(0, this.mass * strength);
    };
    Boid.prototype.separation = function (neighbours, strength) {
        var force = new THREE.Vector3(0, 0, 0);
        if (neighbours.length === 0) {
            return force;
        }
        for (var i = 0; i < neighbours.length; i++) {
            var distance = new THREE.Vector3(this.position.x, this.position.y, this.position.z).distanceTo(neighbours[i].position);
            if (distance < (40 + (10 * this.mass))) {
                var offset = new THREE.Vector3(this.position.x, this.position.y, this.position.z).sub(neighbours[i].position);
                force.add(offset.divideScalar(distance));
            }
        }
        return force.divideScalar(neighbours.length)
            .multiplyScalar(this.mass * strength);
    };
    Boid.prototype.avoidObstacles = function (obstacles, strength) {
        var force = new THREE.Vector3(0, 0, 0);
        for (var i = 0; i < obstacles.length; i++) {
            var distance = new THREE.Vector3(this.position.x, this.position.y, this.position.z).distanceTo(obstacles[i]);
            if (distance < (80 + (10 * this.mass))) {
                var offset = new THREE.Vector3(this.position.x, this.position.y, this.position.z).sub(obstacles[i]);
                force.add(offset.divideScalar(distance));
            }
        }
        return force.multiplyScalar(this.mass * 0.015);
    };
    Boid.prototype.fly = function (neighbours, forces, obstacles) {
        var force = new THREE.Vector3(0, 0, 0);
        force.add(this.alignment(neighbours, forces.a));
        force.add(this.cohesion(neighbours, forces.c));
        force.add(this.separation(neighbours, forces.s));
        force.add(this.avoidObstacles(obstacles, forces.s));
        this.acceleration = force.divideScalar(this.mass);
    };
    Boid.prototype.update = function () {
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(this.speed, this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration = new THREE.Vector3();
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
    };
    return Boid;
}(THREE.LineSegments));
var Engine = (function () {
    function Engine(element, clearColour) {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(clearColour);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(element.clientWidth, element.clientHeight);
        element.appendChild(this.renderer.domElement);
        this.element = element;
        this.scene = new THREE.Scene();
        this.flock = new Flock(this.scene, 200, 400);
        this.obstacles = []
            .concat(this.makeWall(-350, -350, -150, 150, -350, 350))
            .concat(this.makeWall(350, 350, -150, 150, -350, 350))
            .concat(this.makePlane(-350, 350, -150, -350, 350))
            .concat(this.makePlane(-350, 350, 150, -350, 350))
            .concat(this.makeWall(-350, 350, -150, 150, -350, -350))
            .concat(this.makeWall(-350, 350, -150, 150, 350, 350))
            .concat(this.makeWall(-100, -0, -40, 40, 0, 100));
    }
    Engine.prototype.makeWall = function (x0, x1, y0, y1, z0, z1) {
        var points = [];
        var planeLength = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((z1 - z0), 2));
        var numPoints = (planeLength / 20);
        var planeHeight = y1 - y0;
        var numLayers = (planeHeight / 20);
        var deltaX = (x1 - x0) / numPoints;
        var deltaY = planeHeight / numLayers;
        var deltaZ = (z1 - z0) / numPoints;
        for (var i = 0; i <= numLayers; i++) {
            for (var j = 0; j <= numPoints; j++) {
                points.push(new THREE.Vector3(x0 + (deltaX * j), y0 + (deltaY * i), z0 + (deltaZ * j)));
            }
        }
        return points;
    };
    Engine.prototype.makePlane = function (x0, x1, y, z0, z1) {
        var points = [];
        var planeLength = x1 - x0;
        var numPoints = (planeLength / 20);
        var planeHeight = z1 - z0;
        var numLayers = (planeHeight / 20);
        var deltaX = (x1 - x0) / numPoints;
        var deltaZ = (z1 - z0) / numPoints;
        for (var i = 0; i <= numLayers; i++) {
            for (var j = 0; j <= numPoints; j++) {
                points.push(new THREE.Vector3(x0 + (deltaX * j), y, z0 + (deltaZ * i)));
            }
        }
        return points;
    };
    Engine.prototype.enableShadows = function () {
        this.renderer.shadowMap.enabled = true;
    };
    Engine.prototype.setCamera = function (camera) {
        var _this = this;
        this.camera = camera;
        window.addEventListener('resize', function () {
            _this.camera.aspect = _this.element.clientWidth / _this.element.clientHeight;
            _this.camera.updateProjectionMatrix();
            _this.renderer.setSize(_this.element.clientWidth, _this.element.clientHeight);
        }, false);
    };
    Engine.prototype.getCamera = function () {
        return this.camera;
    };
    Engine.prototype.addToFlock = function () {
        if (this.flock.size === this.flock.max) {
            var obsolete = this.flock.flock.shift();
            this.scene.remove(obsolete);
        }
        this.flock.addBoid(this.scene);
    };
    Engine.prototype.update = function () {
        this.flock.updateFlock(this.obstacles);
        this.renderer.render(this.scene, this.camera);
    };
    return Engine;
}());
var Flock = (function () {
    function Flock(scene, initialSize, maxSize) {
        this.flock = [];
        this.max = maxSize;
        this.populate(scene, initialSize);
        this.forces = { a: 0.1, c: 1 / 15, s: 1 };
    }
    Flock.prototype.setSize = function () {
        this.size = this.flock.length;
    };
    Flock.prototype.populate = function (scene, size) {
        var _this = this;
        for (var i = 0; i < size; i++) {
            setTimeout(function () {
                _this.addBoid(scene);
            }, 50 * i);
        }
    };
    Flock.prototype.updateForces = function (a, c, s) {
        this.forces.a = a;
        this.forces.c = c;
        this.forces.s = s;
    };
    Flock.prototype.addBoid = function (scene) {
        var boid = new Boid();
        this.flock.push(boid);
        this.setSize();
        scene.add(boid);
    };
    Flock.prototype.updateFlock = function (obstacles) {
        for (var i = 0; i < this.size; i++) {
            var neighbors = [];
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
        for (var i = 0; i < this.size; i++) {
            this.flock[i].update();
        }
    };
    return Flock;
}());
System.register("interface", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
