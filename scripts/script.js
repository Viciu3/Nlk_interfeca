// Инициализация Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-js-canvas").appendChild(renderer.domElement);

// Создание звезд
const starCount = 200;
const starsGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);
const velocities = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000; // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000; // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000; // z
    velocities[i * 3] = (Math.random() - 0.5) * 0.1; // vx
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1; // vy
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1; // vz
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true });
const stars = new THREE.Points(starsGeometry, starMaterial);
scene.add(stars);

// Линии между звездами
const lineGeometry = new THREE.BufferGeometry();
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true });
const lines = [];
const maxDistance = 100;

function updateLines() {
    scene.remove(...lines);
    lines.length = 0;
    const positions = starsGeometry.attributes.position.array;
    const linePositions = [];

    for (let i = 0; i < starCount; i++) {
        for (let j = i + 1; j < starCount; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < maxDistance) {
                linePositions.push(
                    positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                    positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                );
            }
        }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const line = new THREE.LineSegments(lineGeo, lineMaterial);
    lines.push(line);
    scene.add(line);
}

// Позиция камеры
camera.position.z = 300;

// Анимация
function animate() {
    requestAnimationFrame(animate);

    // Движение звезд
    const positions = starsGeometry.attributes.position.array;
    for (let i = 0; i < starCount; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        if (Math.abs(positions[i * 3]) > 500) velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 500) velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 500) velocities[i * 3 + 2] *= -1;
    }
    starsGeometry.attributes.position.needsUpdate = true;

    // Мерцание звезд
    starMaterial.opacity = Math.sin(Date.now() * 0.001) * 0.3 + 0.7;

    // Легкое вращение камеры
    camera.rotation.y += 0.001;

    // Обновление линий
    updateLines();

    renderer.render(scene, camera);
}
animate();

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Обработка ввода пароля
const passwordInput = document.getElementById("password-input");
const confirmBtn = document.getElementById("confirm-btn");

async function handlePasswordSubmit() {
    const password = passwordInput.value;
    if (password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({ password }),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            alert(result.message || "Password submitted: " + password);
        } catch (error) {
            alert("Password submitted: " + password); // Локальная заглушка
        }
    } else {
        alert("Please enter a password");
    }
}

confirmBtn.addEventListener("click", handlePasswordSubmit);
passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        handlePasswordSubmit();
    }
});