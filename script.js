const canvas = document.getElementById('car-canvas');
let renderer, scene, camera, controls, mixer;
let lastTimestamp = 0;

const sizes = { width: canvas.clientWidth, height: canvas.clientHeight };

function initThree() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
  camera.position.set(2.6, 1.4, 3.2);
  scene.add(camera);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.1);
  mainLight.position.set(5, 5, 5);
  mainLight.castShadow = false;
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x88ddff, 0.6);
  rimLight.position.set(-4, 3, -2);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(6, 64),
    new THREE.MeshStandardMaterial({ color: 0x0d1117, metalness: 0.8, roughness: 0.6 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.75;
  floor.receiveShadow = true;
  scene.add(floor);

  controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.maxDistance = 8;
  controls.minDistance = 2;
  controls.target.set(0, 0.5, 0);

  loadModel();
}

function loadModel() {
  const loader = new THREE.GLTFLoader();
  loader.load(
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Buggy/glTF-Binary/Buggy.glb',
    (gltf) => {
      const model = gltf.scene;
      model.position.set(0, -0.75, 0);
      model.scale.setScalar(0.6);
      model.traverse((child) => {
        if (child.isMesh) {
          child.material.metalness = 0.9;
          child.material.roughness = 0.25;
        }
      });
      scene.add(model);

      mixer = gltf.animations.length ? new THREE.AnimationMixer(model) : null;
      if (mixer && gltf.animations[0]) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }
    },
    undefined,
    (error) => {
      console.error('Model failed to load', error);
    }
  );
}

function onResize() {
  sizes.width = canvas.clientWidth;
  sizes.height = canvas.clientHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function animate(timestamp = 0) {
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  requestAnimationFrame(animate);
  controls.update();
  mixer?.update(delta / 1000);
  renderer.render(scene, camera);
}

function initScrollEffects() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

  const hero = document.querySelector('.hero');
  const setParallax = () => {
    const rect = hero.getBoundingClientRect();
    const offset = Math.min(Math.max(-rect.top * 0.08, -18), 26);
    hero.style.setProperty('--parallax', `${offset}px`);
  };
  document.addEventListener('scroll', setParallax, { passive: true });
  setParallax();
}

function initMenuToggle() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

function enhanceForms() {
  const form = document.querySelector('.contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.classList.add('submitted');
    const button = form.querySelector('button');
    button.textContent = 'Enquiry sent ✓';
    button.disabled = true;
    setTimeout(() => {
      button.textContent = 'Send enquiry';
      button.disabled = false;
      form.classList.remove('submitted');
      form.reset();
    }, 2200);
  });
}

initThree();
initScrollEffects();
initMenuToggle();
enhanceForms();
window.addEventListener('resize', onResize);
animate();
