window.onload = () => {
    const elem = document.getElementById('container');
    elem.innerHTML = "";

    const engine = new Engine(elem, 0xEFCBB8);
    engine.enableShadows();

    // CAMERA
    {
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
    
    elem.addEventListener('click', (event) => {
        console.log('event');
        engine.addBoid(new Boid(Math.random()));
    })

    // START THE ENGINE
    function animate() {
        requestAnimationFrame(animate);
        engine.update();
    }
    animate();
}
