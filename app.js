"use strict";
const COLS=10,ROWS=20,SIZE=30;
const COLORS=[null,"#39e7ff","#ffd34d","#b75cff","#4d76ff","#ff4ca6","#55e87a","#ff8a3d"];
const SHAPES=[[[1,1,1,1]],[[2,2],[2,2]],[[0,3,0],[3,3,3]],[[4,0,0],[4,4,4]],[[0,0,5],[5,5,5]],[[0,6,6],[6,6,0]],[[7,7,0],[0,7,7]]];
const MISSIONS=[
 {galaxy:"Galaxia Aurora",name:"Órbita Lunar",type:"lines",target:3,icon:"☾"},{galaxy:"Galaxia Aurora",name:"Nebulosa Cian",type:"score",target:700,icon:"✦"},
 {galaxy:"Galaxia Aurora",name:"Planeta Prisma",type:"lines",target:5,icon:"◈"},{galaxy:"Galaxia Aurora",name:"Luna Violeta",type:"score",target:1200,icon:"◆"},
 {galaxy:"Galaxia Aurora",name:"Satélite Astro",type:"lines",target:7,icon:"★"},{galaxy:"Galaxia Aurora",name:"Cometa Rosa",type:"score",target:1800,icon:"☄"},
 {galaxy:"Galaxia Aurora",name:"Anillo Solar",type:"lines",target:9,icon:"◉"},{galaxy:"Galaxia Aurora",name:"Portal Aurora",type:"score",target:2500,icon:"◎"},
 {galaxy:"Galaxia Aurora",name:"Estrella Gemela",type:"lines",target:11,icon:"∞"},{galaxy:"Galaxia Aurora",name:"Guardián de Luz",type:"score",target:3200,icon:"♕"},
 {galaxy:"Galaxia Prisma",name:"Cristal Errante",type:"lines",target:10,icon:"◇"},{galaxy:"Galaxia Prisma",name:"Lluvia Espectral",type:"score",target:3000,icon:"☂"},
 {galaxy:"Galaxia Prisma",name:"Órbita Esmeralda",type:"lines",target:13,icon:"●"},{galaxy:"Galaxia Prisma",name:"Cúmulo Magenta",type:"score",target:4000,icon:"✧"},
 {galaxy:"Galaxia Prisma",name:"Planeta Espejo",type:"lines",target:15,icon:"◐"},{galaxy:"Galaxia Prisma",name:"Rayo Cuántico",type:"score",target:5000,icon:"ϟ"},
 {galaxy:"Galaxia Prisma",name:"Laberinto Orbital",type:"lines",target:18,icon:"⌘"},{galaxy:"Galaxia Prisma",name:"Corona de Astro",type:"score",target:6200,icon:"♔"},
 {galaxy:"Galaxia Prisma",name:"Nexo Cromático",type:"lines",target:21,icon:"✣"},{galaxy:"Galaxia Prisma",name:"Titán Prisma",type:"score",target:7500,icon:"⬢"},
 {galaxy:"Galaxia Supernova",name:"Frontera Oscura",type:"lines",target:18,icon:"◒"},{galaxy:"Galaxia Supernova",name:"Púlsar Dorado",type:"score",target:6500,icon:"✹"},
 {galaxy:"Galaxia Supernova",name:"Campo Meteórico",type:"lines",target:22,icon:"✵"},{galaxy:"Galaxia Supernova",name:"Horizonte Rojo",type:"score",target:8000,icon:"◓"},
 {galaxy:"Galaxia Supernova",name:"Vacío Estelar",type:"lines",target:26,icon:"⬡"},{galaxy:"Galaxia Supernova",name:"Motor Infinito",type:"score",target:10000,icon:"∞"},
 {galaxy:"Galaxia Supernova",name:"Tormenta Cósmica",type:"lines",target:30,icon:"≋"},{galaxy:"Galaxia Supernova",name:"Núcleo Ardiente",type:"score",target:12500,icon:"☀"},
 {galaxy:"Galaxia Supernova",name:"Última Supernova",type:"lines",target:35,icon:"✺"},{galaxy:"Galaxia Supernova",name:"Trono Cósmico",type:"score",target:15000,icon:"♛"}
];
const canvas=document.querySelector("#game"),ctx=canvas.getContext("2d"),nextCtx=document.querySelector("#next").getContext("2d");
const ui=Object.fromEntries(["score","level","lines","highScore","overlay","overlayTitle","overlayText","welcome","combo"].map(id=>[id,document.getElementById(id)]));
let board,piece,nextPiece,score,lines,level,dropMs,lastTime,playing=false,paused=false,particles=[],soundOn=true,audio,missionIndex=0,won=false;
const tg=window.Telegram?.WebApp;
function telegramSafe(action){try{return action()}catch(error){console.info("Telegram API no disponible en este contexto:",error?.message)}}
if(tg){telegramSafe(()=>tg.ready());telegramSafe(()=>tg.expand());telegramSafe(()=>tg.setHeaderColor("#09051d"));telegramSafe(()=>tg.setBackgroundColor("#070314"));if(tg.isVersionAtLeast?.("6.2"))telegramSafe(()=>tg.enableClosingConfirmation())}
const user=tg?.initDataUnsafe?.user; if(user?.first_name)ui.welcome.textContent=`¡Hola, ${user.first_name}!`;

function matrix(rows=ROWS,cols=COLS){return Array.from({length:rows},()=>Array(cols).fill(0))}
function randomPiece(){const shape=SHAPES[Math.floor(Math.random()*SHAPES.length)].map(r=>[...r]);return{shape,x:Math.floor((COLS-shape[0].length)/2),y:-1}}
function collide(test=piece){return test.shape.some((row,y)=>row.some((v,x)=>v&&(test.x+x<0||test.x+x>=COLS||test.y+y>=ROWS||(test.y+y>=0&&board[test.y+y][test.x+x]))))}
function merge(){piece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v&&piece.y+y>=0)board[piece.y+y][piece.x+x]=v}))}
function rotate(){const old=piece.shape;piece.shape=old[0].map((_,i)=>old.map(r=>r[i]).reverse());for(const kick of [0,-1,1,-2,2]){piece.x+=kick;if(!collide()){buzz("light");return}piece.x-=kick}piece.shape=old}
function move(dx){piece.x+=dx;if(collide())piece.x-=dx;else buzz("selection")}
function down(soft=false){piece.y++;if(collide()){piece.y--;lock()}else if(soft){score++;updateUI()}resetDrop()}
function hardDrop(){let d=0;while(!collide({...piece,y:piece.y+1})){piece.y++;d++}score+=d*2;burst(piece.x+piece.shape[0].length/2,piece.y+piece.shape.length);tone(130,.06);lock()}
function lock(){merge();const cleared=clearLines();piece=nextPiece;nextPiece=randomPiece();drawNext();if(collide()){gameOver();return}if(cleared)buzz("heavy");resetDrop()}
function clearLines(){let count=0;for(let y=ROWS-1;y>=0;y--){if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(COLS).fill(0));count++;y++;burst(COLS/2,y)}}if(count){const table=[0,100,300,500,800];score+=table[count]*level;lines+=count;level=1+Math.floor(lines/10);dropMs=Math.max(110,850-(level-1)*65);ui.combo.textContent=count===4?"¡SUPERNOVA!":`+${count} LÍNEA${count>1?"S":""}`;ui.combo.classList.remove("show");void ui.combo.offsetWidth;ui.combo.classList.add("show");tone(440,.1);setTimeout(()=>tone(660,.15),100)}updateUI();checkMission();return count}
function resetDrop(){lastTime=performance.now()}
function start(){board=matrix();score=0;lines=0;level=1;dropMs=Math.max(420,850-missionIndex*24);particles=[];piece=randomPiece();nextPiece=randomPiece();playing=true;paused=false;won=false;ui.overlay.classList.add("hidden");drawNext();updateUI();resetDrop();tone(330,.08);requestAnimationFrame(loop)}
function togglePause(){if(!playing)return;paused=!paused;if(paused){ui.overlayTitle.textContent="MISIÓN EN PAUSA";ui.overlayText.textContent="El cosmos esperará.";document.querySelector("#startButton").textContent="CONTINUAR";ui.overlay.classList.remove("hidden")}else{ui.overlay.classList.add("hidden");resetDrop();requestAnimationFrame(loop)}}
function gameOver(){playing=false;const high=Math.max(score,Number(localStorage.getItem("cosmic-high")||0));localStorage.setItem("cosmic-high",high);saveCloud(high);ui.highScore.textContent=high;ui.overlayTitle.textContent="FIN DE LA MISIÓN";ui.overlayText.textContent=`Puntuación: ${score.toLocaleString("es")}`;document.querySelector("#startButton").textContent="VOLVER A JUGAR";ui.overlay.classList.remove("hidden");tone(180,.35)}
function updateUI(){ui.score.textContent=score.toLocaleString("es");ui.level.textContent=level;ui.lines.textContent=lines}
function objective(m){return m.type==="lines"?`Completa ${m.target} líneas`:`Alcanza ${m.target.toLocaleString("es")} puntos`}
function checkMission(){if(won||!playing)return;const m=MISSIONS[missionIndex],done=m.type==="lines"?lines>=m.target:score>=m.target;if(!done)return;won=true;playing=false;const unlocked=Math.max(Number(localStorage.getItem("cosmic-unlocked")||1),Math.min(MISSIONS.length,missionIndex+2));localStorage.setItem("cosmic-unlocked",unlocked);ui.overlayTitle.textContent="¡MISIÓN CUMPLIDA!";ui.overlayText.textContent=`${m.name} completada. La siguiente órbita está disponible.`;document.querySelector("#startButton").textContent="REPETIR MISIÓN";ui.overlay.classList.remove("hidden");burst(COLS/2,ROWS/2);tone(740,.16);setTimeout(()=>tone(980,.22),170);renderMap()}
function renderMap(){const unlocked=Number(localStorage.getItem("cosmic-unlocked")||1),path=document.querySelector("#missionPath");path.innerHTML="";let lastGalaxy="";MISSIONS.forEach((m,i)=>{if(m.galaxy!==lastGalaxy){lastGalaxy=m.galaxy;const heading=document.createElement("div");heading.className=`galaxy-heading galaxy-${Math.floor(i/10)+1}`;heading.innerHTML=`<span>GALAXIA ${Math.floor(i/10)+1}</span><strong>${m.galaxy.replace("Galaxia ","")}</strong><small>Misiones ${i+1}–${Math.min(i+10,MISSIONS.length)}</small>`;path.append(heading)}const button=document.createElement("button");button.className=`mission-node ${i>=unlocked?"locked":i<unlocked-1?"completed":"current"}`;button.disabled=i>=unlocked;button.innerHTML=`<span class="planet">${m.icon}</span><span><b>${i+1}. ${m.name}</b><small>${objective(m)}</small></span>`;button.onclick=()=>selectMission(i);path.append(button)})}
function selectMission(i){missionIndex=i;document.querySelector("#missionNumber").textContent=i+1;document.querySelector("#mapScreen").classList.add("hidden");document.querySelector("#gameScreen").classList.remove("hidden");ui.overlayTitle.textContent=MISSIONS[i].name.toUpperCase();ui.overlayText.textContent=objective(MISSIONS[i]);document.querySelector("#startButton").textContent="INICIAR MISIÓN";ui.overlay.classList.remove("hidden");draw()}
function showMap(){playing=false;paused=false;document.querySelector("#gameScreen").classList.add("hidden");document.querySelector("#mapScreen").classList.remove("hidden");renderMap();scrollTo({top:0,behavior:"smooth"})}
function saveCloud(high){if(tg?.isVersionAtLeast?.("6.9")&&tg.CloudStorage)telegramSafe(()=>tg.CloudStorage.setItem("cosmic-high",String(high),()=>{}))}
function loadHigh(){const local=Number(localStorage.getItem("cosmic-high")||0);ui.highScore.textContent=local;if(tg?.isVersionAtLeast?.("6.9")&&tg.CloudStorage)telegramSafe(()=>tg.CloudStorage.getItem("cosmic-high",(_,v)=>{if(v)ui.highScore.textContent=Math.max(local,Number(v))}))}
function drawBlock(c,x,y,v,size=SIZE,alpha=1){if(!v)return;c.save();c.globalAlpha=alpha;const pad=2,g=c.createLinearGradient(x*size,y*size,(x+1)*size,(y+1)*size);g.addColorStop(0,"#fff");g.addColorStop(.13,COLORS[v]);g.addColorStop(1,"#28155e");c.fillStyle=g;c.shadowColor=COLORS[v];c.shadowBlur=10;c.fillRect(x*size+pad,y*size+pad,size-pad*2,size-pad*2);c.strokeStyle="rgba(255,255,255,.45)";c.strokeRect(x*size+pad+1,y*size+pad+1,size-pad*2-2,size-pad*2-2);c.restore()}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle="rgba(120,100,190,.09)";for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*SIZE,0);ctx.lineTo(x*SIZE,ROWS*SIZE);ctx.stroke()}for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*SIZE);ctx.lineTo(COLS*SIZE,y*SIZE);ctx.stroke()}board?.forEach((r,y)=>r.forEach((v,x)=>drawBlock(ctx,x,y,v)));if(piece){let ghost={...piece,y:piece.y};while(!collide({...ghost,y:ghost.y+1}))ghost.y++;ghost.shape.forEach((r,y)=>r.forEach((v,x)=>drawBlock(ctx,ghost.x+x,ghost.y+y,v,SIZE,.18)));piece.shape.forEach((r,y)=>r.forEach((v,x)=>drawBlock(ctx,piece.x+x,piece.y+y,v)))}drawParticles()}
function drawNext(){nextCtx.clearRect(0,0,100,100);const s=20,ox=(100-nextPiece.shape[0].length*s)/2/s,oy=(100-nextPiece.shape.length*s)/2/s;nextPiece.shape.forEach((r,y)=>r.forEach((v,x)=>drawBlock(nextCtx,ox+x,oy+y,v,s)))}
function burst(x,y){for(let i=0;i<22;i++)particles.push({x:x*SIZE,y:y*SIZE,vx:(Math.random()-.5)*6,vy:(Math.random()-.7)*6,life:1,color:COLORS[1+Math.floor(Math.random()*7)]})}
function drawParticles(){particles=particles.filter(p=>p.life>0);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.life-=.035;ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4)}ctx.globalAlpha=1}
function loop(t){if(!playing||paused)return;if(t-lastTime>dropMs)down();draw();requestAnimationFrame(loop)}
function buzz(type){tg?.HapticFeedback?.impactOccurred?.(type==="heavy"?"heavy":"light")}
function tone(freq,duration){if(!soundOn)return;audio??=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(.08,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}
function notice(title,message){if(tg?.showPopup)tg.showPopup({title,message,buttons:[{type:"ok"}]});else alert(`${title}\n\n${message}`)}
document.querySelector("#startButton").onclick=()=>paused?togglePause():start();document.querySelector("#pauseButton").onclick=togglePause;
document.querySelector("#mapButton").onclick=showMap;
document.querySelector("#soundButton").onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?"♫":"×"};
document.querySelectorAll("[data-action]").forEach(b=>{const act=()=>{if(!playing||paused)return;({left:()=>move(-1),right:()=>move(1),rotate,down:()=>down(true),drop:hardDrop})[b.dataset.action]()};b.addEventListener("pointerdown",e=>{e.preventDefault();act()})});
addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," ","p","P"].includes(e.key))e.preventDefault();if(!playing||paused){if((e.key==="p"||e.key==="P")&&paused)togglePause();return}({ArrowLeft:()=>move(-1),ArrowRight:()=>move(1),ArrowDown:()=>down(true),ArrowUp:rotate," ":hardDrop,p:togglePause,P:togglePause})[e.key]?.()});
document.querySelector("#rewardButton").onclick=()=>notice("Recompensas","Aquí se conectará un proveedor de anuncios recompensados. No se concede ninguna recompensa en este prototipo.");
document.querySelector("#shopButton").onclick=()=>notice("Tienda cósmica","Los cosméticos se cobrarán con Telegram Stars mediante facturas creadas por el bot. Requiere backend y bot configurado.");
document.querySelector("#tournamentButton").onclick=()=>notice("Torneos","La clasificación verificable y los premios requieren servidor, reglas oficiales y revisión legal según tu país.");
document.querySelector("#sponsorButton").onclick=()=>notice("Espacio para patrocinador","Configura aquí el enlace de una marca colaboradora antes de publicar.");
loadHigh();renderMap();draw();
