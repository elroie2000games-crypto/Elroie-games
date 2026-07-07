const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const WORLD = 4000;
const WALL = 20; // 🟥 קירות

let gameStarted = false;

let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

let camX = 0, camY = 0;

function rand(min,max){return Math.random()*(max-min)+min}
function dist(x1,y1,x2,y2){return Math.hypot(x1-x2,y1-y2)}

let joystick = document.getElementById("joystick");
let stick = document.getElementById("stick");

let joyX = 0;
let joyY = 0;

let dragging = false;

function moveJoystick(x,y){
	let max = 40;

	let length = Math.hypot(x,y);

	if(length > max){
		x = x / length * max;
		y = y / length * max;
	}

	stick.style.transform = `translate(${x}px, ${y}px)`;

	joyX = x / max;
	joyY = y / max;
}

joystick.addEventListener("pointerdown", e=>{
	dragging = true;
	joystick.setPointerCapture(e.pointerId);
});

joystick.addEventListener("pointermove", e=>{
	if(!dragging)return;

	let rect = joystick.getBoundingClientRect();

	let x = e.clientX - (rect.left + rect.width/2);
	let y = e.clientY - (rect.top + rect.height/2);

	moveJoystick(x,y);
});

joystick.addEventListener("pointerup", ()=>{
	dragging = false;
	moveJoystick(0,0);
});

joystick.addEventListener("pointercancel", ()=>{
	dragging = false;
	moveJoystick(0,0);
});

let boosting = false;
let boostTimer = 0;

let boostBtn = document.getElementById("boost");

boostBtn.addEventListener("pointerdown",()=>{
	boosting = true;
});

boostBtn.addEventListener("pointerup",()=>{
	boosting = false;
});

boostBtn.addEventListener("pointercancel",()=>{
	boosting = false;
});

document.addEventListener("keydown", e=>{
	if(e.code==="Space"){
		boosting = true;
	}
});

document.addEventListener("keyup", e=>{
	if(e.code==="Space"){
		boosting = false;
	}
});

// 🎨 סקין שחקן
let selectedSkin = null;

const skins = [
	"cyan","red","blue","purple","orange",
	"lime","pink","gold","rainbow","hotpink"
];

const skinsDiv = document.getElementById("skins");
const startBtn = document.getElementById("startBtn");
document.getElementById("boost").style.display="block";

skins.forEach(color=>{
	let div=document.createElement("div");
	div.className="skin";

	if(color==="rainbow"){
		div.style.background="linear-gradient(90deg,red,orange,yellow,green,blue)";
	}else{
		div.style.background=color;
	}

	div.onclick=()=>{
		document.querySelectorAll(".skin").forEach(s => s.classList.remove("selected"));
		div.classList.add("selected");

		selectedSkin=color;

		startBtn.disabled=false;
		startBtn.style.background="lime";
	};

	skinsDiv.appendChild(div);
});

startBtn.onclick=()=>{
	if(!selectedSkin) return;

	document.getElementById("lobby").style.display="none";
	gameStarted=true;
	document.getElementById("joystick").style.display="flex";

	start();
};

// 🍎 FOOD
class Food {
	constructor(){
		this.x = rand(0, WORLD);
		this.y = rand(0, WORLD);
		this.size = rand(4, 12);
		this.color = `hsl(${Math.random()*360},100%,60%)`;
	}

	respawn(){
		this.x = rand(0, WORLD);
		this.y = rand(0, WORLD);
		this.size = rand(4, 12);
		this.color = `hsl(${Math.random()*360},100%,60%)`;
	}

	draw(){
		ctx.shadowBlur = 25;
		ctx.shadowColor = this.color;

		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x - camX, this.y - camY, this.size, 0, Math.PI * 2);
		ctx.fill();

		ctx.shadowBlur = 0;
	}
}

// 🟥 קירות ציור
function drawWalls(){
	ctx.shadowBlur = 0;
	ctx.fillStyle = "red";

	ctx.fillRect(-camX, -camY, WORLD, WALL);
	ctx.fillRect(-camX, WORLD - WALL - camY, WORLD, WALL);
	ctx.fillRect(-camX, -camY, WALL, WORLD);
	ctx.fillRect(WORLD - WALL - camX, -camY, WALL, WORLD);
}

// 💀 בדיקת קירות
function checkWalls(s){
	if(
		s.x < WALL ||
		s.x > WORLD - WALL ||
		s.y < WALL ||
		s.y > WORLD - WALL
	){
		s.x = 2000;
		s.y = 2000;
		s.len = 25;
	}
}

// 🐍 SNAKE
class Snake {
	constructor(x,y,color,isBot=false){
		this.x=x;
		this.y=y;
		this.color=color;
		this.isBot=isBot;

		this.angle=0;

		// ⚡ שינוי: מהירות גבוהה יותר
		this.speed=2.5;
		this.boostSpeed=4.5;

		this.len=25;
		this.segments=[{x,y}];

		this.target=null;
		this.timer=0;
	}

	update(foods){

		if(!this.isBot){
	let mx=0,my=0;

	if(keys["w"]||keys["arrowup"])my--;
	if(keys["s"]||keys["arrowdown"])my++;
	if(keys["a"]||keys["arrowleft"])mx--;
	if(keys["d"]||keys["arrowright"])mx++;

	if(Math.abs(joyX)>0.1 || Math.abs(joyY)>0.1){
		mx = joyX;
		my = joyY;
	}

	if(mx||my)this.angle=Math.atan2(my,mx);
}

		else{

			if(!this.target || this.timer<=0){

				let sorted = foods
					.map(f=>({f,d:dist(this.x,this.y,f.x,f.y)}))
					.sort((a,b)=>a.d-b.d);

				let poolSize = Math.min(5,sorted.length);
				let pool = sorted.slice(0,poolSize);

				this.target = pool[Math.floor(Math.random()*pool.length)].f;
				this.timer=60;
			}

			this.timer--;

			if(this.target){
				let dx=this.target.x-this.x;
				let dy=this.target.y-this.y;

				let a=Math.atan2(dy,dx);

				this.angle += (a-this.angle)*0.08;
			}
		}

		let currentSpeed = this.speed;

		if(!this.isBot && boosting && this.len > 5){
			currentSpeed = this.boostSpeed;

			boostTimer++;

			if(boostTimer >= 60){
				this.len--;
				boostTimer=0;
			}
		}

		this.x += Math.cos(this.angle)*currentSpeed;
		this.y += Math.sin(this.angle)*currentSpeed;



		this.x=Math.max(0,Math.min(WORLD,this.x));
		this.y=Math.max(0,Math.min(WORLD,this.y));

		this.segments.unshift({x:this.x,y:this.y});
		while(this.segments.length>this.len)this.segments.pop();
	}

	draw(){
		for(let i=this.segments.length-1;i>=0;i--){
			let s=this.segments[i];

			ctx.fillStyle=this.color==="rainbow"
				? `hsl(${Date.now()/10+i*10},100%,60%)`
				: (i===0?"white":this.color);

			ctx.beginPath();
			ctx.arc(s.x-camX,s.y-camY,10,0,Math.PI*2);
			ctx.fill();
		}
	}
}

// ===== GAME =====
let player;
let foods=[];
let bots=[];

function start(){

	player=new Snake(2000,2000,selectedSkin,false);

	for(let i=0;i<300;i++){
		foods.push(new Food());
	}

	let colors=["red","blue","cyan","lime","purple","orange","pink","gold","rainbow","hotpink"];

	for(let i=0;i<8;i++){
		let c=colors[Math.floor(Math.random()*colors.length)];
		bots.push(new Snake(rand(0,WORLD),rand(0,WORLD),c,true));
	}

	loop();
}

function updateCam(){
	camX=player.x-innerWidth/2;
	camY=player.y-innerHeight/2;
}

function eat(s){
	for(let f of foods){
		if(dist(s.x,s.y,f.x,f.y)<15){
			s.len+=3;
			f.respawn();
			return;
		}
	}
}

function loop(){

	if(!gameStarted)return;

	// ⚡ שיפור ביצועים קטן
	ctx.setTransform(1,0,0,1,0,0);
	ctx.fillStyle="#05070f";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	updateCam();

	drawWalls();

	for(let f of foods)f.draw();

	player.update(foods);
	checkWalls(player);
	eat(player);
	player.draw();

	for(let b of bots){
		b.update(foods);
		checkWalls(b);
		eat(b);
		b.draw();
	}

	requestAnimationFrame(loop);
}