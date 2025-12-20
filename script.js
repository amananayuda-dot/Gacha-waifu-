const sRoulette = new Audio("sroulette.m4a");
sRoulette.loop = true;

const sRahasia = new Audio("srahasia.m4a");

let score = Number(localStorage.getItem("score")) || 0;
let autoSpin = false;
let autoInterval = null;

document.getElementById("score").innerText = score;

function make(type, count, point, text) {
  return Array.from({length: count}, (_,i)=>({
    id:`${type}${i+1}`,
    file:`${type}${i+1}.jpg`,
    type, point, text
  }));
}

const chars = [
  ...make("common",5,1,"Common +1"),
  ...make("rare",6,3,"Rare +3"),
  ...make("epic",6,10,"Epic +10"),
  ...make("mitos",5,100,"🔥 MITOS +100 🔥"),
  ...make("rahasia",8,500,"🌊 RAHASIA +500 🌊")
];

const saved = JSON.parse(localStorage.getItem("unlocked")||"[]");
const indexBox = document.getElementById("index");

chars.forEach(c=>{
  const d=document.createElement("div");
  d.className=`card ${c.type==="mitos"?"mitosB":c.type==="rahasia"?"rahasiaB":c.type} ${saved.includes(c.id)?"":"locked"}`;
  d.dataset.id=c.id;
  d.innerHTML=`<img src="${c.file}">`;
  indexBox.appendChild(d);
});

function spin(){
  const btn = document.getElementById("spinBtn");
  const img = document.getElementById("resultImg");

  btn.disabled = true;
  img.style.display = "block";

  // RESET CLASS TAPI AMAN
  img.classList.remove("roulette","mitos","rahasia");

  // === ROULETTE START ===
  img.classList.add("roulette");

  sRoulette.currentTime = 0;
  sRoulette.play().catch(()=>{});

  let rouletteInterval = setInterval(()=>{
    const rand = chars[Math.floor(Math.random() * chars.length)];
    img.src = rand.file;
  }, 100);

  setTimeout(()=>{
    clearInterval(rouletteInterval);

    sRoulette.pause();
    sRoulette.currentTime = 0;

    img.classList.remove("roulette");

    // === PICK RESULT ===
    const r = Math.random()*100000;
    let pool;
    if(r < 50000) pool = chars.filter(c=>c.type==="common");
    else if(r < 75000) pool = chars.filter(c=>c.type==="rare");
    else if(r < 95000) pool = chars.filter(c=>c.type==="epic");
    else if(r < 99990) pool = chars.filter(c=>c.type==="mitos");
    else pool = chars.filter(c=>c.type==="rahasia");

    const pick = pool[Math.floor(Math.random() * pool.length)];

    showResult(pick);
    btn.disabled = false;
  }, 1800);
}


function showResult(pick){
  const img = document.getElementById("resultImg");

  img.src = pick.file;
  img.classList.remove("mitos","rahasia");

  if(pick.type === "mitos"){
    img.classList.add("mitos");
  }

  if(pick.type === "rahasia"){
    playSecretAnimation(pick.file);
  }

  document.getElementById("resultText").innerText = pick.text;

  score += pick.point;
  document.getElementById("score").innerText = score;

  unlock(pick.id);
  saveGame();
  const autoBtn = document.getElementById("autoBtn");
if(score >= 2000){
  autoBtn.innerText = autoSpin ? "AUTO SPIN ⏸" : "AUTO SPIN ▶";
}
}



function unlock(id){
  const c=document.querySelector(`[data-id="${id}"]`);
  if(c) c.classList.remove("locked");
}

function saveGame(){
  localStorage.setItem("score",score);
  const u=[...document.querySelectorAll(".card:not(.locked)")].map(c=>c.dataset.id);
  localStorage.setItem("unlocked",JSON.stringify(u));
}

function resetGame(){
  if(confirm("⚠️ Semua progress akan hilang. Yakin?")){
    localStorage.clear();
    location.reload();
  }
}

/* ===================== */
/* RAHASIA EFFECT */
/* ===================== */
function playSecretAnimation(file){
  const overlay=document.getElementById("secretOverlay");
  const img=document.getElementById("secretImg");
  const card=document.querySelector(".secret-card");
  img.src=file;

  overlay.style.display="flex";

  sRahasia.currentTime=0;
  sRahasia.play().catch(()=>{});

  sRahasia.onloadedmetadata=()=>{
    const dur=sRahasia.duration*1000;

    setTimeout(()=>{
      card.classList.add("secret-explode");
      startParticles();
    }, dur-600);

    setTimeout(()=>{
      overlay.style.display="none";
      card.classList.remove("secret-explode");
    }, dur);
  };
}

/* PARTICLES */
function startParticles(){
  const c=document.getElementById("particleCanvas");
  const ctx=c.getContext("2d");
  c.width=innerWidth; c.height=innerHeight;

  let p=[];
  for(let i=0;i<120;i++){
    p.push({
      x:innerWidth/2,
      y:innerHeight/2,
      vx:(Math.random()-0.5)*10,
      vy:(Math.random()-0.5)*10,
      life:60
    });
  }

  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    p.forEach(pt=>{
      ctx.fillStyle="rgba(127,255,212,.8)";
      ctx.fillRect(pt.x,pt.y,3,3);
      pt.x+=pt.vx;
      pt.y+=pt.vy;
      pt.life--;
    });
    p=p.filter(pt=>pt.life>0);
    if(p.length) requestAnimationFrame(draw);
  }
  draw();
}

function toggleAuto(){
  if(score < 2000){
    alert("🔒 Auto Spin terbuka saat skor mencapai 2000!");
    return;
  }

  autoSpin = !autoSpin;
  const btn = document.getElementById("autoBtn");

  if(autoSpin){
    btn.classList.add("active");
    btn.innerText = "AUTO SPIN ⏸";
    autoInterval = setInterval(()=>{
      if(!document.getElementById("spinBtn").disabled){
        spin();
      }
    }, 2100); // sedikit lebih lama dari 1.8 detik
  } else {
    btn.classList.remove("active");
    btn.innerText = "AUTO SPIN ▶";
    clearInterval(autoInterval);
  }
}
function openWA(){
  window.open(
    "https://whatsapp.com/channel/0029Vb78FqRHLHQatRO8ys2M",
    "_blank"
  );
}

function openTikTok(){
  window.open("https://tiktok.com/@vern_oza","_blank");
  score += 50;
  document.getElementById("score").innerText = score;
  saveGame();
    }
