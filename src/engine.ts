///<reference path="../definitions/three.d.ts"/>

class Engine {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    public flock: Flock;
    private element: HTMLElement;
    private obstacles: THREE.Vector3[];

    public constructor(element: HTMLElement, clearColour: number) {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(clearColour);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(element.clientWidth, element.clientHeight);
        element.appendChild(this.renderer.domElement);
        this.element = element;

        this.scene = new THREE.Scene();
        this.flock = new Flock(this.scene, 100, 400);
        this.obstacles = []
            .concat(this.makeWall(-350, -350, -150, 150, -350, 350))
            .concat(this.makeWall(350, 350, -150, 150, -350, 350))
            .concat(this.makePlane(-350, 350, -150, -350, 350))
            .concat(this.makePlane(-350, 350, 150, -350, 350))
            // .concat(this.makeWall(-350, 350, -150, 150, -350, -350))
            // .concat(this.makeWall(-350, 350, -150, 150, 350, 350))
            .concat(this.makeWall(-100, -0, -40, 40, 0, 100))
    }

    private makeWall(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
        const points = [];
        const planeLength = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((z1 - z0), 2));
        const numPoints = (planeLength / 20);
        const planeHeight = y1 - y0;
        const numLayers = (planeHeight / 20);
        const deltaX = (x1 - x0) / numPoints;
        const deltaY = planeHeight / numLayers;
        const deltaZ = (z1 - z0) / numPoints;
        for (let i = 0; i <= numLayers; i++) {
            for (let j = 0; j <= numPoints; j++) {
                points.push(new THREE.Vector3(x0 + (deltaX * j), y0 + (deltaY * i), z0 + (deltaZ * j)));
            }
        }
        return points
    }

    private makePlane(x0: number, x1: number, y: number, z0: number, z1: number) {
        const points = [];
        const planeLength = x1 - x0;
        const numPoints = (planeLength / 20);
        const planeHeight = z1 - z0;
        const numLayers = (planeHeight / 20);
        const deltaX = (x1 - x0) / numPoints;
        const deltaZ = (z1 - z0) / numPoints;
        for (let i = 0; i <= numLayers; i++) {
            for (let j = 0; j <= numPoints; j++) {
                points.push(new THREE.Vector3(x0 + (deltaX * j), y, z0 + (deltaZ * i)));
            }
        }
        return points
    }

    public enableShadows(): void {
        this.renderer.shadowMap.enabled = true;
    }

    public setCamera(camera: THREE.PerspectiveCamera): void {
        this.camera = camera;
        window.addEventListener('resize', () => {
            this.camera.aspect = this.element.clientWidth / this.element.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
        }, false);
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public addToFlock() {
        if (this.flock.size === this.flock.max) {
            const obsolete = this.flock.flock.shift();
            this.scene.remove(obsolete);
        }
        this.flock.addBoid(this.scene);
    }

    public update(): void {
        this.flock.updateFlock(this.obstacles);
        this.renderer.render(this.scene, this.camera);
    }

    // public steer(direction: string) {
    //     this.flock.steer(direction);
    // }
}