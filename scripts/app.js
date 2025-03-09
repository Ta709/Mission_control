document.getElementById('showPathButton').addEventListener('click', function() {
    const initialWeight = parseFloat(document.getElementById('weight').value);
    const thrust = parseFloat(document.getElementById('thrust').value);
    const angle = parseFloat(document.getElementById('angle').value);
    const burnRate = parseFloat(document.getElementById('burnRate').value);

    if (isNaN(initialWeight) || isNaN(thrust) || isNaN(angle) || isNaN(burnRate)) {
        alert('Please enter valid numbers');
        return;
    }

    const canvas = document.getElementById('flightPathCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Convert angle to radians
    const angleRad = angle * (Math.PI / 180);

    // Initial velocity components
    let velocityX = (thrust / initialWeight) * Math.cos(angleRad);
    let velocityY = (thrust / initialWeight) * Math.sin(angleRad);

    // Gravity constant
    const g = 9.81;

    // Air density (kg/m^3)
    const rho = 1.225;

    // Drag coefficient (dimensionless)
    const Cd = 0.75;

    // Cross-sectional area of the rocket (m^2)
    const A = 0.1;

    // Time step for simulation
    const dt = 0.1;

    // Initial position and time
    let x = 0;
    let y = 0;
    let t = 0;
    let weight = initialWeight;

    // Zoom factor
    let zoom = 1;

    ctx.beginPath();
    ctx.moveTo(x, canvas.height - y);

    // Simulate the flight path
    function update() {
        if (y >= 0) {
            t += dt;

            // Calculate drag force
            const v = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            const Fd = 0.5 * rho * v * v * Cd * A;

            // Calculate acceleration components
            let ax, ay;
            if (weight > 0) {
                ax = (thrust * Math.cos(angleRad) - Fd * (velocityX / v)) / weight;
                ay = (thrust * Math.sin(angleRad) - weight * g - Fd * (velocityY / v)) / weight;
                weight -= burnRate * dt;
            } else {
                ax = -Fd * (velocityX / v) / initialWeight;
                ay = -g - (Fd * (velocityY / v) / initialWeight);
            }

            // Update velocity components
            velocityX += ax * dt;
            velocityY += ay * dt;

            // Update position
            x += velocityX * dt;
            y += velocityY * dt;

            ctx.lineTo(x * zoom, canvas.height - y * zoom);
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.stroke();

            requestAnimationFrame(update);
        } else {
            // Display the total time
            document.getElementById('totalTime').textContent = t.toFixed(2);

            // Store flight history
            const historyList = document.getElementById('historyList');
            const listItem = document.createElement('li');
            listItem.textContent = `Weight: ${initialWeight} kg, Thrust: ${thrust} N, Angle: ${angle}°, Burn Rate: ${burnRate} kg/s, Time: ${t.toFixed(2)} s`;
            historyList.appendChild(listItem);
        }
    }

    update();

    // Zoom in and out with mouse wheel
    canvas.addEventListener('wheel', function(event) {
        if (event.deltaY < 0) {
            zoom *= 1.1;
        } else {
            zoom /= 1.1;
        }
        ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
        event.preventDefault();
    });
});