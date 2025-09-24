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
        constructor(canvasId, resolution){
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.resolution = resolution;
            this.cols = 0; this.rows = 0; this.grid = []; this.cellAge = [];
            this.lastUpdateTime = 0; this.updateInterval = 100; this.lastResetTime = 0; this.resetInterval = 20000;
            this.init();
        }
        init() {
            this.setupGrid(); this.randomizeGrid();
            requestAnimationFrame((t)=>this.gameLoop(t));
            window.addEventListener('resize', ()=>{ this.setupGrid(); this.randomizeGrid(); });
        }
        setupGrid() {
            this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight;
            this.cols = Math.floor(this.canvas.width/this.resolution); this.rows = Math.floor(this.canvas.height/this.resolution);
            this.grid = Array.from({length:this.cols}, ()=>Array(this.rows).fill(0));
            this.cellAge = Array.from({length:this.cols}, ()=>Array(this.rows).fill(0));
        }
        randomizeGrid() {
            for(let i=0;i<this.cols;i++) for(let j=0;j<this.rows;j++){
                this.grid[i][j] = Math.random()>0.85?1:0; this.cellAge[i][j] = this.grid[i][j];
            }
        }
        computeNextGeneration(){
            const nG = Array.from({length:this.cols}, ()=>Array(this.rows).fill(0));
            for(let i=0;i<this.cols;i++){
                for(let j=0;j<this.rows;j++){
                    const s=this.grid[i][j]; const n=this._countNeighbors(this.grid,i,j);
                    if(s===0 && n===3){ nG[i][j]=1; this.cellAge[i][j]=1; }
                    else if(s===1&&(n<2||n>3)){ nG[i][j]=0; this.cellAge[i][j]=0; }
                    else{ nG[i][j]=s; if(s===1)this.cellAge[i][j]++; }
                }
            }
            return nG;
        }
        _countNeighbors(g,x,y){
            let s=0; for(let i=-1;i<2;i++) for(let j=-1;j<2;j++){
                if(i===0&&j===0)continue; s+=g[(x+i+this.cols)%this.cols][(y+j+this.rows)%this.rows];
            } return s;
        }
        drawGrid(){
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            for(let i=0;i<this.cols;i++) for(let j=0;j<this.rows;j++){
                if(this.grid[i][j]===1){
                    const h=260+(this.cellAge[i][j]*2), s=100, l=50+Math.min(this.cellAge[i][j],20);
                    this.ctx.fillStyle=`hsl(${h},${s}%,${l}%)`;
                    this.ctx.shadowColor=`hsl(${h},${s}%,${l}%)`; this.ctx.shadowBlur=10;
                    this.ctx.fillRect(i*this.resolution,j*this.resolution,this.resolution,this.resolution);
                }
            }
            this.ctx.shadowBlur=0;
        }
        gameLoop(t){
            if(t-this.lastUpdateTime>this.updateInterval){ this.grid=this.computeNextGeneration(); this.drawGrid(); this.lastUpdateTime=t; }
            if(t-this.lastResetTime>this.resetInterval){ this.randomizeGrid(); this.lastResetTime=t; }
            requestAnimationFrame((ts)=>this.gameLoop(ts));
        }
    }
    new Automaton('automaton-canvas',20);

    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.content-section').forEach(section=>{
        gsap.from(section.querySelectorAll('h2, p, .project-card'),{
            y:50, opacity:0, duration:1, stagger:0.2,
            scrollTrigger:{ trigger: section, start: 'top 80%' }
        });
    });

    const canvas=document.getElementById('automaton-canvas');
    window.addEventListener('mousemove', e=>{
        const mouseX=(e.clientX/window.innerWidth)-0.5;
        const mouseY=(e.clientY/window.innerHeight)-0.5;
        gsap.to(canvas,{x:mouseX*30, y:mouseY*30, duration:0.5, ease:'power2.out'});
    });
});
