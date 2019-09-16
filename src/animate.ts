window.onload = () => {
    const elem = document.getElementById('container');
    elem.innerHTML = "";

    const engine = new Engine(elem, 0xFFFFFF);

    setCamera();

    // CAMERA

    elem.addEventListener('click', (event) => {
        engine.addToFlock();
    })

    elem.addEventListener('keydown', (event) => {
        let dir = '';
        switch (event.keyCode) {
            case 37:
                dir = 'left';
                break;
            case 38:
                dir = 'down';
                break;
            case 39:
                dir = 'right';
                break;
            case 40:
                dir = 'up';
                break;
            default:
                break;
        }
        // engine.steer(dir);
    })


    window.onresize = function (event) {
        setCamera();
    };

    document.getElementById('align').addEventListener('change', (event) => {
        updateForces();
    })
    document.getElementById('cohesion').addEventListener('change', (event) => {
        updateForces()
    })
    document.getElementById('separate').addEventListener('change', (event) => {
        updateForces()
    })

    function setCamera() {
        let camera = new THREE.PerspectiveCamera(75, window.innerWidth / elem.clientHeight, 0.2, 1000);
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
        engine.flock.updateForces
            (parseFloat((<HTMLInputElement>document.getElementById('align')).value),
                parseFloat((<HTMLInputElement>document.getElementById('cohesion')).value),
                parseFloat((<HTMLInputElement>document.getElementById('separate')).value))
    }

    // START THE ENGINE
    function animate() {
        requestAnimationFrame(animate);
        engine.update();
    }
    animate();
}
