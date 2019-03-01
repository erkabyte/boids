///<reference path="../definitions/three.d.ts"/>

class Engine {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private light: THREE.Light;
    private height: number;
    public boids: Boid[];
    private element: HTMLElement;

    public constructor(element: HTMLElement, clearColour: number) {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(clearColour);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(element.clientWidth, element.clientHeight);
        element.appendChild(this.renderer.domElement);
        this.boids = [];

		this.scene = new THREE.Scene();
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
    
    public setBackground(): void {
        this.scene.background = new THREE.Color(0xEFCBB8);
    }
    
    public addBoid(object: Boid): void {
        if(this.boids.length === 20) {
            const obsolete = this.boids.shift();
            this.scene.remove(obsolete);
        }
        this.boids.push(object);
		this.scene.add(object);
    }
    
    public update(): void {
        for (let i = 0; i < this.boids.length; i++) {
            this.boids[i].fly(this.boids);
        }
		this.renderer.render(this.scene, this.camera);
	}
}