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
  ...make("common",6,1,"Common +1"),
  ...make("rare",8,3,"Rare +3"),
  ...make("epic",9,10,"Epic +10"),
  ...make("mitos",17,100,"🔥 MITOS +100 🔥"),
  ...make("rahasia",11,500,"🌊 RAHASIA +500 🌊")
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
    else if(r < 89000) pool = chars.filter(c=>c.type==="epic");
    else if(r < 99000) pool = chars.filter(c=>c.type==="mitos");
    else pool = chars.filter(c=>c.type==="rahasia");

    const pick = pool[Math.floor(Math.random() * pool.length)];

    showResult(pick);
    btn.disabled = false;
  }, 1800);
}


function showResult(pick){
  const img = document.getElementById("resultImg");

  /* ===== RESET ===== */
  img.className = "";
  img.src = pick.file;

  /* ===== MITOS ===== */
  if(pick.type === "mitos"){
    img.classList.add("mitos");
  }

  /* ===== RAHASIA ===== */
  if(pick.type === "rahasia"){
    img.classList.add("rahasia-explode");

    setTimeout(()=>{
      img.classList.remove("rahasia-explode");
      img.classList.add("rahasia");
    }, 600);

    playSecretAnimation(pick.file);
  }

  /* ===== UI ===== */
  document.getElementById("resultText").innerText = pick.text;
  score += pick.point;
  document.getElementById("score").innerText = score;

  unlock(pick.id);
  saveGame();

  /* ===== AUTO SPIN (INI PUNYA KAMU, AMAN) ===== */
  const autoBtn = document.getElementById("autoBtn");
  if(autoBtn && autoBtn.dataset.active === "true"){
    setTimeout(spin, 700);
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
  const overlay = document.getElementById("secretOverlay");
  const img = document.getElementById("secretImg");
  const card = document.querySelector(".secret-card");
  const btn = document.getElementById("spinBtn");

  img.src = file;
  overlay.style.display = "flex";
  btn.disabled = true;

  // sound
  sRahasia.currentTime = 6;
  sRahasia.play().catch(()=>{});

  // reset class
  card.classList.remove("secret-explode");

  // delay ledakan
  setTimeout(()=>{
    card.classList.add("secret-explode");
    startParticles();
  }, 500);

  // auto close (AMAN)
  setTimeout(closeSecret, 3500);

  // klik buat close manual
  overlay.onclick = closeSecret;

  function closeSecret(){
    overlay.style.display = "none";
    card.classList.remove("secret-explode");
    btn.disabled = false;
    overlay.onclick = null;
  }
}


/* PARTICLES */
function startParticles(){
  const c = document.getElementById("particleCanvas");
  const ctx = c.getContext("2d");
  c.width = innerWidth;
  c.height = innerHeight;

  let p = [];

  for(let i=0;i<250;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = Math.random()*12+6;
    p.push({
      x: innerWidth/2,
      y: innerHeight/2,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      life: 80,
      size: Math.random()*4+2
    });
  }

  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    p.forEach(pt=>{
      ctx.fillStyle = `rgba(0,255,200,${pt.life/80})`;
      ctx.beginPath();
      ctx.arc(pt.x,pt.y,pt.size,0,Math.PI*2);
      ctx.fill();
      pt.x+=pt.vx;
      pt.y+=pt.vy;
      pt.life--;
    });
    p = p.filter(pt=>pt.life>0);
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
