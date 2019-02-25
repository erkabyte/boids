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
    engine.enableShadows();
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
        console.log('event');
        engine.addBoid(new Boid(Math.random()));
    });
    function animate() {
        requestAnimationFrame(animate);
        engine.update();
    }
    animate();
};
var Boid = (function (_super) {
    __extends(Boid, _super);
    function Boid(weight) {
        var _this = this;
        var geometry = new THREE.ConeBufferGeometry(2, 6, 8);
        var edges = new THREE.EdgesGeometry(geometry, 1);
        edges.applyMatrix(new THREE.Matrix4().makeTranslation(0, -1, 0));
        edges.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        _this = _super.call(this, edges, new THREE.LineBasicMaterial({
            color: 0xffffff
        })) || this;
        _this.position.x = -200;
        _this.position.y = 25;
        _this.position.z = 200;
        _this.direction = new THREE.Vector3(1, 0, -1);
        _this.weight = weight;
        return _this;
    }
    Boid.prototype.alignWithVelocityVector = function () {
        var alignment = new THREE.Vector3().addVectors(this.direction, this.position);
        this.lookAt(alignment);
    };
    Boid.prototype.normalize = function () {
        var total = Math.max(Math.abs(this.direction.x), Math.abs(this.direction.z), Math.abs(this.direction.y));
        this.direction.divideScalar(total);
        this.direction.multiplyScalar(0.5 + this.weight);
    };
    Boid.prototype.fly = function () {
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
        this.normalize();
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
        this.boids = [];
        this.scene = new THREE.Scene();
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
    Engine.prototype.addBoid = function (object) {
        if (this.boids.length === 20) {
            var obsolete = this.boids.shift();
            this.scene.remove(obsolete);
        }
        this.boids.push(object);
        this.scene.add(object);
    };
    Engine.prototype.update = function () {
        for (var i = 0; i < this.boids.length; i++) {
            this.boids[i].fly();
        }
        this.renderer.render(this.scene, this.camera);
    };
    return Engine;
}());
