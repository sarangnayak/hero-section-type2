document.addEventListener('DOMContentLoaded', () => {
    gsap.set("#theGradient", { attr: { x1: -1000, x2: 0 } });
    gsap.to("#theGradient", {
        duration: 3,
        attr: { x1: 1000, x2: 2000 },
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.5,
        ease: "none"
    });

    class Automaton {
        constructor(canvasId, resolution) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resolution = resolution;
            this.cols = 0;
            this.rows = 0;
            this.grid = [];
            this.cellAge = [];
            this.lastUpdateTime = 0;
            this.updateInterval = 100;
            this.lastResetTime = 0;
            this.resetInterval = 20000;
            this.init();
        }

        init() {
            this.setupGrid();
            this.randomizeGrid();
            requestAnimationFrame((t) => this.gameLoop(t));
            window.addEventListener('resize', () => {
                this.setupGrid();
                this.randomizeGrid();
            });
        }

        setupGrid() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.cols = Math.floor(this.canvas.width / this.resolution);
            this.rows = Math.floor(this.canvas.height / this.resolution);
            this.grid = Array.from({ length: this.cols }, () => Array(this.rows).fill(0));
            this.cellAge = Array.from({ length: this.cols }, () => Array(this.rows).fill(0));
        }

        randomizeGrid() {
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    this.grid[i][j] = Math.random() > 0.85 ? 1 : 0;
                    this.cellAge[i][j] = this.grid[i][j];
                }
            }
        }

        computeNextGeneration() {
            const nextGrid = Array.from({ length: this.cols }, () => Array(this.rows).fill(0));
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    const state = this.grid[i][j];
                    const neighbors = this._countNeighbors(this.grid, i, j);
                    if (state === 0 && neighbors === 3) {
                        nextGrid[i][j] = 1;
                        this.cellAge[i][j] = 1;
                    } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                        nextGrid[i][j] = 0;
                        this.cellAge[i][j] = 0;
                    } else {
                        nextGrid[i][j] = state;
                        if (state === 1) this.cellAge[i][j]++;
                    }
                }
            }
            return nextGrid;
        }

        _countNeighbors(grid, x, y) {
            let sum = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    sum += grid[(x + i + this.cols) % this.cols][(y + j + this.rows) % this.rows];
                }
            }
            return sum;
        }

        drawGrid() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    if (this.grid[i][j] === 1) {
                        const h = 260 + this.cellAge[i][j] * 2;
                        const s = 100;
                        const l = 50 + Math.min(this.cellAge[i][j], 20);
                        ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
                        ctx.shadowColor = `hsl(${h}, ${s}%, ${l}%)`;
                        ctx.shadowBlur = 8;
                        ctx.fillRect(i * this.resolution, j * this.resolution, this.resolution, this.resolution);
                    }
                }
            }
            ctx.shadowBlur = 0;
        }

        gameLoop(time) {
            if (time - this.lastUpdateTime > this.updateInterval) {
                this.grid = this.computeNextGeneration();
                this.drawGrid();
                this.lastUpdateTime = time;
            }
            if (time - this.lastResetTime > this.resetInterval) {
                this.randomizeGrid();
                this.lastResetTime = time;
            }
            requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }

    new Automaton('automaton-canvas', 20);

    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.content-section').forEach(section => {
        gsap.from(section.querySelectorAll('h2, p, .project-card'), {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            scrollTrigger: { trigger: section, start: 'top 80%' }
        });
    });

    const canvas = document.getElementById('automaton-canvas');
    window.addEventListener('mousemove', e => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        gsap.to(canvas, { x: mouseX * 30, y: mouseY * 30, duration: 0.5, ease: 'power2.out' });
    });
});
