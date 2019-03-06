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
    var engine = new Engine(elem, 0xEFCBB8);
    {
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
    elem.addEventListener('click', function (event) {
        engine.addToFlock();
    });
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
        _this.position.x = -150;
        _this.position.y = 30;
        _this.position.z = 150;
        _this.weight = Math.random();
        _this.direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        _this.visibility = 40 + (10 * _this.weight);
        return _this;
    }
    Boid.prototype.alignWithVelocityVector = function () {
        var alignment = new THREE.Vector3().addVectors(this.direction, this.position);
        this.lookAt(alignment);
    };
    Boid.prototype.normalize = function () {
        var total = Math.max(Math.abs(this.direction.x), Math.abs(this.direction.z), Math.abs(this.direction.y));
        this.direction.divideScalar(total);
        this.direction.multiplyScalar(1.5 - (this.weight / 10));
    };
    Boid.prototype.alignment = function (neighbours) {
        var vel_x = 0;
        var vel_y = 0;
        var vel_z = 0;
        for (var i = 0; i < neighbours.length; i++) {
            vel_x += neighbours[i].direction.x;
            vel_y += neighbours[i].direction.y;
            vel_z += neighbours[i].direction.z;
        }
        if (neighbours.length) {
            this.direction.x += (vel_x / neighbours.length) / (this.weight * 10);
            this.direction.y += (vel_y / neighbours.length) / (this.weight * 10);
            this.direction.z += (vel_z / neighbours.length) / (this.weight * 10);
        }
    };
    Boid.prototype.cohesion = function () {
        var pos_x = 0;
        var pos_y = 0;
        var pos_z = 0;
        for (var i = 0; i < this.neighbours.length; i++) {
            pos_x += this.neighbours[i].position.x;
            pos_y += this.neighbours[i].position.y;
            pos_z += this.neighbours[i].position.z;
        }
        if (this.neighbours.length) {
            this.direction.x += ((pos_x / this.neighbours.length) - this.position.x) / (this.weight / 0.1);
            this.direction.y += ((pos_y / this.neighbours.length) - this.position.y) / (this.weight / 0.1);
            this.direction.z += ((pos_z / this.neighbours.length) - this.position.z) / (this.weight / 0.1);
        }
    };
    Boid.prototype.separation = function () {
        var pos_x = 0;
        var pos_y = 0;
        var pos_z = 0;
        for (var i = 0; i < this.neighbours.length; i++) {
            pos_x += this.neighbours[i].position.x;
            pos_y += this.neighbours[i].position.y;
            pos_z += this.neighbours[i].position.z;
        }
        if (this.neighbours.length) {
            this.direction.x += (this.position.x - (pos_x / this.neighbours.length));
            this.direction.y += (this.position.y - (pos_y / this.neighbours.length));
            this.direction.z += (this.position.z - (pos_z / this.neighbours.length));
        }
    };
    Boid.prototype.isVisible = function (boid) {
        return Math.abs(boid.position.x - this.position.x) < this.visibility &&
            Math.abs(boid.position.y - this.position.y) < this.visibility &&
            Math.abs(boid.position.z - this.position.z) < this.visibility;
    };
    Boid.prototype.isForcible = function (boid) {
        return Math.abs(boid.position.x - this.position.x) < this.force &&
            Math.abs(boid.position.y - this.position.y) < this.force &&
            Math.abs(boid.position.z - this.position.z) < this.force;
    };
    Boid.prototype.fly = function (neighbours) {
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
        this.alignment(neighbours);
        this.position.x += this.direction.x;
        this.position.y += this.direction.y;
        this.position.z += this.direction.z;
        if (this.direction.x > 2) {
            this.direction.x = 2;
        }
        if (this.direction.y > 2) {
            this.direction.y = 2;
        }
        if (this.direction.z > 2) {
            this.direction.z = 2;
        }
        if (this.direction.x < -2) {
            this.direction.x = -2;
        }
        if (this.direction.y < -2) {
            this.direction.y = -2;
        }
        if (this.direction.z < -2) {
            this.direction.z = -2;
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
        this.scene = new THREE.Scene();
        this.flock = new Flock(this.scene, 20, 40);
    }
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
    Engine.prototype.setBackground = function () {
        this.scene.background = new THREE.Color(0xEFCBB8);
    };
    Engine.prototype.addToFlock = function () {
        if (this.flock.size === this.flock.max) {
            var obsolete = this.flock.flock.shift();
            this.scene.remove(obsolete);
        }
        this.flock.addBoid(this.scene);
    };
    Engine.prototype.update = function () {
        this.flock.updateFlock();
        this.renderer.render(this.scene, this.camera);
    };
    return Engine;
}());
var Flock = (function () {
    function Flock(scene, initialSize, maxSize) {
        this.flock = [];
        this.max = maxSize;
        this.populate(scene, initialSize);
        this.distance = 20;
        this.distanceSquared = Math.pow(this.distance, 2);
    }
    Flock.prototype.setSize = function () {
        this.size = this.flock.length;
    };
    Flock.prototype.populate = function (scene, size) {
        for (var i = 0; i < size; i++) {
            this.addBoid(scene);
        }
    };
    Flock.prototype.addBoid = function (scene) {
        var boid = new Boid();
        this.flock.push(boid);
        this.setSize();
        scene.add(boid);
    };
    Flock.prototype.updateFlock = function () {
        for (var i = 0; i < this.size; i++) {
            var neighbors = [];
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
    };
    return Flock;
}());
