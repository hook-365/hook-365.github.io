const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toggleLinesCheckbox = document.getElementById('toggleLines');
const lineCountInput = document.getElementById('lineCountInput');
const controls = document.getElementById('controls');
const toggleCrawlCheckbox = document.getElementById('toggleCrawl');


let showLines = false; // they're not the focus, but if you look behind the scenes
let lineCount = 20; // initial desired visualization, but let your mind explore
let lines = [];
let crawlMode = false; // Initially disabled
const speed = 1;

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

setCanvasSize();

function getRandomPoint(maxX, maxY) {
    const speedMultiplier = Math.random() * 1 + 0.1; // Random speed between 0.1x and 5.1x
    return {
        x: Math.random() * maxX,
        y: Math.random() * maxY,
        dx: (Math.random() - 0.5) * speed * speedMultiplier, // Variable speed in x direction
        dy: (Math.random() - 0.5) * speed * speedMultiplier  // Variable speed in y direction
    };
}

function drawLine(line) {
    ctx.save(); // Save the current context state

    ctx.setLineDash([5, 15]); // Dashed lines: [dash length, gap length]
    ctx.strokeStyle = '#D55E00'; // Dark orange, colorblind-friendly
    ctx.shadowColor = '#D55E00'; // Glow color
    ctx.shadowBlur = 10; // Glow intensity

    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.stroke();

    ctx.restore(); // Restore the context state
}



function crossProduct(A, B) {
    return A.x * B.y - A.y * B.x;
}

function getIntersection(line1, line2) {
    const { start: A, end: B } = line1;
    const { start: C, end: D } = line2;

    const AB = { x: B.x - A.x, y: B.y - A.y };
    const CD = { x: D.x - C.x, y: D.y - C.y };
    const AC = { x: C.x - A.x, y: C.y - A.y };

    const denominator = crossProduct(AB, CD);
    if (denominator === 0) return null;

    const t = crossProduct(AC, CD) / denominator;
    const u = crossProduct(AC, AB) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: A.x + t * AB.x,
            y: A.y + t * AB.y
        };
    }

    return null;
}

function updateLines() {
    const { width, height } = canvas;
    const wiggleAmountX = 0.2; // Adjust this for more horizontal wiggle
    const wiggleAmountY = 0.05; // Adjust this for more or less vertical wiggle
    const maxSpeed = 1;         // Maximum allowed speed after wiggle (regular movement speed)

    for (const line of lines) {
        for (const point of [line.start, line.end]) {
            if (crawlMode) {
                // Introduce a small random jitter in direction, with more horizontal variation
                point.dx += (Math.random() - 0.5) * wiggleAmountX; // More left-right wiggle
                point.dy += (Math.random() - 0.5) * wiggleAmountY; // Less up-down wiggle

                // Normalize the speed to ensure it doesn't exceed maxSpeed
                let speed = Math.sqrt(point.dx * point.dx + point.dy * point.dy);
                if (speed > maxSpeed) {
                    point.dx *= maxSpeed / speed;
                    point.dy *= maxSpeed / speed;
                }
            }

            point.x += point.dx;
            point.y += point.dy;

            // Handle bouncing off edges
            if (point.x <= 0 || point.x >= width) {
                point.dx *= -1; // Reverse direction
                point.x = Math.min(Math.max(point.x, 0), width); // Prevent going out of bounds
            }
            if (point.y <= 0 || point.y >= height) {
                point.dy *= -1; // Reverse direction
                point.y = Math.min(Math.max(point.y, 0), height); // Prevent going out of bounds
            }
        }
    }
}


function drawIntersection(point) {
    const fixedSize = 3; // Fixed size for all intersection points

    ctx.save(); // Save the current context state

    ctx.beginPath();
    ctx.arc(point.x, point.y, fixedSize, 0, Math.PI * 2);
    ctx.fillStyle = '#00bfff'; // Light blue color for intersections
    ctx.shadowColor = '#00bfff'; // Glow color
    ctx.shadowBlur = 15; // Glow intensity
    ctx.fill();

    ctx.restore(); // Restore the context state
}




function generateLines(count) {
    const { width, height } = canvas;
    lines = Array.from({ length: count }, () => ({
        start: getRandomPoint(width, height),
        end: getRandomPoint(width, height)
    }));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showLines) {
        lines.forEach(drawLine);
    }

    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            const intersection = getIntersection(lines[i], lines[j]);
            if (intersection) {
                drawIntersection(intersection); // Use the simplified intersection drawing
            }
        }
    }

    updateLines();
    requestAnimationFrame(animate);
}





toggleLinesCheckbox.addEventListener('change', (e) => {
    showLines = e.target.checked;
});

toggleCrawlCheckbox.addEventListener('change', (e) => {
    crawlMode = e.target.checked;
});

let debounceTimeout;
lineCountInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        lineCount = Math.min(Math.max(parseInt(e.target.value, 10), 1), 100);
        generateLines(lineCount);
    }, 300);
});

window.addEventListener('resize', setCanvasSize);

generateLines(lineCount);
animate();

setTimeout(() => controls.style.opacity = '1', 7000);