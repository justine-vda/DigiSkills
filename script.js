const pages=["home","l4","mission","tips","about"].reduce((o,id)=>(o[id]=document.getElementById(id),o),{});
const toast=document.getElementById("toast");
function showPage(id){Object.values(pages).forEach(p=>p.classList.remove("show"));pages[id].classList.add("show");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===id));scrollTo({top:0,behavior:"smooth"});}
function notify(t){toast.textContent=t;toast.classList.add("show");clearTimeout(notify.t);notify.t=setTimeout(()=>toast.classList.remove("show"),2000)}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-scroll]").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.scroll).scrollIntoView({behavior:"smooth"})));
document.querySelectorAll(".year").forEach(b=>b.addEventListener("click",()=>b.dataset.year==="L4"?showPage("l4"):notify(`${b.dataset.year} komt binnenkort.`)));
document.querySelectorAll(".mission").forEach(b=>b.addEventListener("click",()=>{
  if(["comm","thinking","working"].includes(b.dataset.mission)) openMission(b.dataset.mission);
  else notify("Deze missie bouwen we binnenkort.");
}));

let stage=1,done=new Set(),s={practice:0,practiceScore:0,mastery:0,masteryScore:0};
let discoverIndex=0;
let discoverRevealed=false;
let stageStarted=false;
const activity=document.getElementById("activity");
const prog=document.getElementById("prog");
const progText=document.getElementById("progText");
const missionStepCount=document.getElementById("missionStepCount");

let missionKey="comm";

function openMission(key="comm"){
  missionKey=key;
  showPage("mission");
  stage=1;
  done=new Set();
  s={practice:0,practiceScore:0,mastery:0,masteryScore:0};
  discoverIndex=0;
  discoverRevealed=false;
  thinkingIndex=0;
  thinkingRevealed=false;
  s.robotLevel=0;
  s.robotCommands=[];
  s.robotRunning=false;
  desktopPracticeIndex=0;
  desktopMasteryIndex=0;
  desktopView="root";
  desktopOpenApp="explorer";
  desktopDiscoverVisited=new Set();
  stageStarted=false;
  updateProgress();
  const label=document.getElementById("missionLabel");
  if(label) label.textContent=missionKey==="thinking" ? "DIGISKILLS · MISSIE 2" : missionKey==="working" ? "DIGISKILLS · MISSIE 3" : "DIGISKILLS · MISSIE 1";
  render();
}

function totalStages(){
  return missionKey==="thinking" ? 4 : 3;
}

function updateProgress(){
  const total=totalStages();
  prog.style.width=`${done.size/total*100}%`;
  progText.textContent=`${done.size} / ${total} voltooid`;
  missionStepCount.textContent=`Stap ${stage} van ${total}`;
}

function stageIntro(){
  const mission2 = missionKey==="thinking";
  const mission3 = missionKey==="working";
  const info = mission2 ? [
    {n:1,icon:"🤖",title:"Ontdek & leer",text:"Ontdek hoe een algoritme werkt en leer het verschil tussen een algoritme en een sequentie. Daarna maak je kennis met decompositie, patroonherkenning en abstractie.",button:"Start met ontdekken →"},
    {n:2,icon:"🧩",title:"Inoefenen",text:"Oefen de vijf begrippen en gebruik ze stap voor stap om problemen op te lossen.",button:"Start met inoefenen →"},
    {n:3,icon:"🏆",title:"Beheersing",text:"Combineer alles in moeilijkere opdrachten. Ontwerp, test en verbeter je oplossing.",button:"Start de beheersing →"},
    {n:4,icon:"🤖",title:"Robotmissie",text:"Gebruik alles wat je geleerd hebt. Maak een algoritme, let op de sequentie, plan je route, verzamel de kristallen en verbeter je oplossing als Robo vastloopt.",button:"Start de robotmissie →"}
  ][stage-1] : mission3 ? [
    {n:1,icon:"🖥️",title:"Ontdek & leer",text:"Verken een echt nagebouwd bureaublad. Ontdek apparaten, het toetsenbord, bestanden en mappen door zelf te klikken.",button:"Open het bureaublad →"},
    {n:2,icon:"📁",title:"Inoefenen",text:"Voer korte opdrachten uit op je digitale computer. Open mappen, vind bestanden en kies de juiste toets of het juiste apparaat.",button:"Start met inoefenen →"},
    {n:3,icon:"🏆",title:"Beheersing",text:"Krijg een digitale werkdag en los alles zelfstandig op: apparaten kiezen, bestanden ordenen en je werk correct bewaren.",button:"Start de digitale werkdag →"}
  ][stage-1] : [
    {n:1,icon:"💬",title:"Ontdek & leer",text:"Je ontdekt de vier belangrijke begrippen: verzender, ontvanger, online en offline.",button:"Start met ontdekken →"},
    {n:2,icon:"🧩",title:"Inoefenen",text:"Nu ga je de begrippen oefenen in korte, duidelijke situaties.",button:"Start met inoefenen →"},
    {n:3,icon:"🏆",title:"Beheersing",text:"Alles komt nu door elkaar. De opdrachten worden iets moeilijker.",button:"Start de beheersing →"}
  ][stage-1];

  activity.innerHTML=`
    <div class="stage-intro-screen">
      <div class="stage-intro-number">${info.n}</div>
      <div class="stage-intro-icon">${info.icon}</div>
      <p class="kicker">STAP ${info.n} VAN ${mission2?4:3}</p>
      <h1>${info.title}</h1>
      <p>${info.text}</p>
      <button class="next intro-button" id="startStage">${info.button}</button>
    </div>`;
  document.getElementById("startStage").onclick=()=>{
    stageStarted=true; updateProgress(); render();
    activity.scrollIntoView({behavior:"smooth",block:"start"});
  };
}

function updateStages(){
  updateProgress();
}

function nextStage(){
  done.add(stage);
  const total=totalStages();

  if(stage<total){
    renderStageComplete();
  }else{
    renderMissionComplete();
  }
  updateProgress();
}

function continueToNextStage(){
  stage=Math.min(totalStages(),stage+1);
  stageStarted=false;
  if(stage===2){
    s.practice=0;
    s.practiceScore=0;
  }
  if(stage===3){
    s.mastery=0;
    s.masteryScore=0;
  }
  if(stage===4){
    s.robotLevel=0;
    s.robotCommands=[];
    s.robotRunning=false;
  }
  updateProgress();
  render();
  activity.scrollIntoView({behavior:"smooth",block:"start"});
}

function renderStageComplete(){
  const mission2=missionKey==="thinking";
  const mission3=missionKey==="working";
  const nextTitles=mission2
    ? {1:"Stap 2: Inoefenen →",2:"Stap 3: Beheersing →",3:"Stap 4: Robotmissie →"}
    : {1:"Stap 2: Inoefenen →",2:"Stap 3: Beheersing →"};
  const doneTitle=mission2
    ? ({1:"Ontdek & leer afgerond!",2:"Inoefenen afgerond!",3:"Beheersing afgerond!"}[stage])
    : (stage===1?"Ontdek & leer afgerond!":"Inoefenen afgerond!");
  const message=mission2
    ? ({1:"Goed zo! Je kent nu de vijf principes van computationeel denken.",2:"Goed zo! Je hebt de begrippen geoefend.",3:"Knap! Je kunt de principes nu door elkaar herkennen en toepassen."}[stage])
    : mission3
      ? ({1:"Goed zo! Je hebt het bureaublad verkend en ontdekt hoe apparaten, toetsen en bestanden samenwerken.",2:"Goed zo! Je kunt nu zelfstandig werken met apparaten, toetsen en mappen."}[stage])
      : (stage===1?"Goed zo! Je kent nu de vier belangrijke begrippen.":"Goed zo! Je hebt de leerstof goed geoefend.");

  activity.innerHTML=`
    <div class="stage-complete-screen">
      <div class="complete-icon">✓</div>
      <p class="kicker">GOED ZO!</p>
      <h1>${doneTitle}</h1>
      <p>${message}</p>
      <button class="next intro-button" id="continueStage">${nextTitles[stage]}</button>
    </div>
  `;
  document.getElementById("continueStage").onclick=continueToNextStage;
}

function renderMissionComplete(){
  activity.innerHTML=`
    <div class="stage-complete-screen">
      <div class="complete-icon trophy">🏆</div>
      <p class="kicker">MISSIE VOLTOOID!</p>
      <h1>Knap gedaan!</h1>
      <p>${missionKey==="thinking" ? "Je hebt algoritmes, sequenties, decompositie, patroonherkenning en abstractie geleerd, geoefend én gebruikt in een echte robotmissie." : missionKey==="working" ? "Je hebt apparaten, toetsen, bestanden en mappen geleerd, geoefend én toegepast in een digitale werkdag." : "Je hebt verzender, ontvanger, online en offline geleerd, geoefend en beheerst."}</p>
      <div class="final-score">${missionKey==="thinking" ? "🤖 Robotmissie voltooid!" : missionKey==="working" ? "🖥️ Digitale werkdag voltooid!" : `${s.masteryScore} / ${mq.length}`}</div>
      <div class="complete-actions">
        <button class="next intro-button" id="again">Opnieuw doen</button>
        <button class="back" id="backToL4">← Terug naar L4</button>
      </div>
    </div>
  `;
  document.getElementById("again").onclick=()=>openMission(missionKey);
  document.getElementById("backToL4").onclick=()=>showPage("l4");
}

function render(){
  if(!stageStarted){
    stageIntro();
    return;
  }
  if(missionKey==="thinking"){
    if(stage===1) discoverThinking();
    if(stage===2) practiceThinking();
    if(stage===3) masteryThinking();
    if(stage===4) robotMission();
  }else if(missionKey==="working"){
    if(stage===1) desktopDiscover();
    if(stage===2) desktopPractice();
    if(stage===3) desktopMastery();
  }else{
    if(stage===1) discover();
    if(stage===2) practice();
    if(stage===3) mastery();
  }
}

function card(title,body){
  activity.innerHTML=`<h3>${title}</h3><p class="intro">${body}</p><div class="box" id="box"></div>`;
}

/* 1 — ONTDEK & LEER: interactief ontdekken, één begrip per keer */
const concepts = [
  {
    color: "blue",
    icon: "📤",
    clue: "Iemand die iets verstuurt",
    term: "Verzender",
    definition: "De verzender is de persoon die iets verstuurt.",
    example: "Emma stuurt een foto naar Milan. Emma is de verzender."
  },
  {
    color: "green",
    icon: "📥",
    clue: "Iemand die iets krijgt",
    term: "Ontvanger",
    definition: "De ontvanger is de persoon die iets krijgt.",
    example: "Emma stuurt een foto naar Milan. Milan is de ontvanger."
  },
  {
    color: "yellow",
    icon: "🌐",
    clue: "Je bent verbonden met het internet",
    term: "Online",
    definition: "Online betekent dat je verbonden bent met het internet.",
    example: "Je opent een website. Je bent online."
  },
  {
    color: "purple",
    icon: "📴",
    clue: "Je hebt geen internet nodig",
    term: "Offline",
    definition: "Offline betekent dat je geen internetverbinding nodig hebt.",
    example: "Je bekijkt een video die al op je tablet staat. Je bent offline."
  }
];


function discover(){
  discoverRevealed = false;

  card(
    "💬 Ontdek & leer",
    "Ontdek de vier belangrijke begrippen. Klik op de kaart en ontdek wat het woord betekent."
  );

  renderDiscoverCard();
}

function renderDiscoverCard(){
  const c = concepts[discoverIndex];
  const box = document.getElementById("box");

  box.innerHTML = `
    <div class="discover-progress">
      <span>Begrip ${discoverIndex + 1} van ${concepts.length}</span>
      <div class="discover-dots">
        ${concepts.map((_, i) => `<i class="${i === discoverIndex ? "active" : i < discoverIndex ? "done" : ""}"></i>`).join("")}
      </div>
    </div>

    <div class="concept-wrap">
      <button class="concept-flip ${discoverRevealed ? "revealed" : ""} concept-${c.color}" id="conceptFlip" aria-label="Klik om het begrip te ontdekken">
        <span class="concept-face concept-front">
          <span class="concept-icon">${c.icon}</span>
          <span class="concept-label">Wat hoort hierbij?</span>
          <strong>${c.clue}</strong>
          <span class="concept-hint">Klik om te ontdekken →</span>
        </span>

        <span class="concept-face concept-back">
          <span class="concept-icon">${c.icon}</span>
          <span class="concept-reveal-label">Dit begrip is...</span>
          <strong>${c.term}</strong>
          <span class="concept-definition">${c.definition}</span>
          <span class="concept-example"><b>Voorbeeld:</b> ${c.example}</span>
        </span>
      </button>
    </div>

    <div class="discover-action" id="discoverAction">
      ${discoverRevealed
        ? `<button class="next" id="discoverNext">${discoverIndex === concepts.length - 1 ? "Alle begrippen ontdekt →" : "Volgend begrip →"}</button>`
        : `<p>💡 Klik op de kaart om het begrip te onthullen.</p>`
      }
    </div>
  `;

  document.getElementById("conceptFlip").onclick = () => {
    if (!discoverRevealed) {
      discoverRevealed = true;
      renderDiscoverCard();
    }
  };

  if (discoverRevealed) {
    document.getElementById("discoverNext").onclick = () => {
      if (discoverIndex < concepts.length - 1) {
        discoverIndex++;
        discoverRevealed = false;
        renderDiscoverCard();
      } else {
        discoverIndex = 0;
        nextStage();
      }
    };
  }
}



/* MISSIE 3 — DIGITAAL WERKEN: een echt nagebouwd bureaublad */
const desktopFiles={
  root:[
    {type:"folder",name:"Schoolwerk",icon:"📁"},
    {type:"folder",name:"Foto's",icon:"📁"},
    {type:"folder",name:"Downloads",icon:"📁"},
    {type:"file",name:"planning.docx",icon:"📄"},
    {type:"file",name:"klasfoto.jpg",icon:"🖼️"}
  ],
  school:[
    {type:"folder",name:"Nederlands",icon:"📁"},
    {type:"folder",name:"Wiskunde",icon:"📁"},
    {type:"folder",name:"WO",icon:"📁"},
    {type:"file",name:"spreekbeurt.pptx",icon:"📊"},
    {type:"file",name:"werkblad.docx",icon:"📄"}
  ],
  nederlands:[
    {type:"file",name:"boekbespreking.docx",icon:"📄"},
    {type:"file",name:"spreekbeurt.pptx",icon:"📊"}
  ],
  foto:[
    {type:"file",name:"klasfoto.jpg",icon:"🖼️"},
    {type:"file",name:"uitstap.png",icon:"🖼️"}
  ],
  downloads:[
    {type:"file",name:"robotspel.pdf",icon:"📕"},
    {type:"file",name:"nieuwsbrief.pdf",icon:"📕"}
  ]
};
const desktopFolders={root:"Mijn bestanden",school:"Schoolwerk",nederlands:"Nederlands",foto:"Foto's",downloads:"Downloads"};
let desktopView="root";
let desktopOpenApp="explorer";
let desktopDiscoverDone=new Set();
let desktopDiscoverVisited=new Set();
let desktopPracticeIndex=0;
let desktopPracticeState={selected:null};

function desktopShell(content,opts={}){
  const time=new Date().toLocaleTimeString("nl-BE",{hour:"2-digit",minute:"2-digit"});
  return `<div class="desktop-wrap">\n    <div class="desktop-wallpaper">\n      <div class="desktop-orb orb-a"></div><div class="desktop-orb orb-b"></div>\n      <div class="desktop-icons">\n        <button class="desktop-icon" data-desktop-action="pc"><span>💻</span><b>Deze pc</b></button>\n        <button class="desktop-icon" data-desktop-action="files"><span>📁</span><b>Bestanden</b></button>\n        <button class="desktop-icon" data-desktop-action="keyboard"><span>⌨️</span><b>Toetsenbord</b></button>\n        <button class="desktop-icon" data-desktop-action="trash"><span>🗑️</span><b>Prullenbak</b></button>\n      </div>\n      <div class="desktop-window-area">${content}</div>\n      <div class="desktop-taskbar">\n        <button class="task-start" data-desktop-action="start">◈</button>\n        <button class="task-search" data-desktop-action="search">⌕ <span>Zoeken</span></button>\n        <button class="task-app active" data-desktop-action="files">📁</button>\n        <button class="task-app" data-desktop-action="keyboard">⌨️</button>\n        <div class="task-spacer"></div><div class="task-status">⌃ &nbsp; Wi-Fi &nbsp; 🔊 &nbsp; ${time}</div>\n      </div>\n    </div>\n  </div>`;
}
function desktopWindow(title,inner,crumb="Mijn bestanden"){
  return `<div class="desktop-window">\n    <div class="window-titlebar"><div class="window-title"><span>📁</span><b>${title}</b></div><div class="window-controls"><i>−</i><i>□</i><i>×</i></div></div>\n    <div class="window-toolbar"><button class="window-back" data-desktop-nav="up">←</button><span>›</span><span>${crumb}</span></div>\n    <div class="window-body">${inner}</div>\n  </div>`;
}
function renderDesktopDiscover(){
  let title="Mijn bestanden",inner="";
  if(desktopOpenApp==="keyboard"){
    title="Toetsenbord";
    inner=`<div class="keyboard-app"><p class="desktop-kicker">ONTDEK</p><h3>Dit is je toetsenbord</h3><p>Klik op een toets om te ontdekken waarvoor je die gebruikt.</p><div class="fake-keyboard">${["Esc","1","2","3","4","5","6","7","8","9","0","Backspace","Tab","Q","W","E","R","T","Y","U","I","O","P","Enter","Shift","A","S","D","F","G","H","J","K","L","Shift","Ctrl","Alt","Spatie","←","↑","↓","→"].map(k=>`<button data-key="${k}">${k}</button>`).join("")}</div><div class="key-explain" id="keyExplain">Klik op een toets.</div></div>`;
  } else if(desktopOpenApp==="pc"){
    title="Deze pc";
    inner=`<div class="device-grid"><button class="device-card input" data-device="keyboard"><span>⌨️</span><b>Toetsenbord</b><small>Input</small></button><button class="device-card input" data-device="mouse"><span>🖱️</span><b>Muis</b><small>Input</small></button><button class="device-card input" data-device="microphone"><span>🎙️</span><b>Microfoon</b><small>Input</small></button><button class="device-card output" data-device="screen"><span>🖥️</span><b>Scherm</b><small>Output</small></button><button class="device-card output" data-device="printer"><span>🖨️</span><b>Printer</b><small>Output</small></button><button class="device-card output" data-device="speakers"><span>🔊</span><b>Luidsprekers</b><small>Output</small></button></div><div class="device-note" id="deviceNote">Klik op een apparaat.</div>`;
  } else if(desktopOpenApp==="trash"){
    title="Prullenbak"; inner=`<div class="empty-trash"><span>🗑️</span><h3>De prullenbak is leeg</h3><p>Verwijderde bestanden komen hier terecht.</p></div>`;
  } else if(desktopOpenApp==="search"){
    title="Zoeken"; inner=`<div class="search-app"><p class="desktop-kicker">ZOEKEN</p><h3>Wat wil je openen?</h3><div class="fake-search">⌕ <span>Typ hier om te zoeken</span></div><div class="search-suggestions"><button data-search-file="spreekbeurt.pptx">📊 spreekbeurt.pptx</button><button data-search-file="planning.docx">📄 planning.docx</button></div></div>`;
  } else {
    const items=desktopFiles[desktopView]||desktopFiles.root;
    inner=`<div class="explorer-layout"><aside><button class="side-item active" data-desktop-nav="root">🏠 Start</button><button class="side-item" data-desktop-nav="school">📁 Schoolwerk</button><button class="side-item" data-desktop-nav="foto">🖼️ Foto's</button><button class="side-item" data-desktop-nav="downloads">⬇️ Downloads</button></aside><section><div class="file-path">Deze pc &nbsp;›&nbsp; ${desktopFolders[desktopView]}</div><div class="file-grid">${items.map((it,i)=>`<button class="file-item ${it.type==="folder"?"file-folder":"file-document"}" data-file-type="${it.type}" data-file-name="${it.name}" data-file-index="${i}"><span>${it.icon}</span><b>${it.name}</b>${it.type==="folder"?"<small>Map</small>":"<small>Bestand</small>"}</button>`).join("")}</div></section></div>`;
  }
  return desktopShell(desktopWindow(title,inner,desktopFolders[desktopView]||title));
}
function renderDesktopDiscoverActivity(){
  document.getElementById("box").innerHTML=renderDesktopDiscover()+`
    <div class="discover-completion">
      <div><b>${desktopDiscoverVisited.size} van 4 onderdelen ontdekt</b><span>Open Deze pc, Bestanden, Toetsenbord en Prullenbak om verder te kunnen.</span></div>
      <button class="next" id="finishDesktopDiscover" ${desktopDiscoverVisited.size<4?"disabled":""}>Klaar met verkennen →</button>
    </div>`;
  bindDesktopDiscover();
  const finish=document.getElementById("finishDesktopDiscover");
  if(finish) finish.onclick=()=>{ if(desktopDiscoverVisited.size>=4) nextStage(); };
}
function desktopDiscover(){
  desktopOpenApp="explorer"; desktopView="root";
  card("🖥️ Ontdek & leer","Verken het bureaublad. Klik op de pictogrammen en ontdek zelf wat elk onderdeel doet.");
  renderDesktopDiscoverActivity();
}
function bindDesktopDiscover(){
  document.querySelectorAll("[data-desktop-action]").forEach(b=>b.onclick=()=>{
    const a=b.dataset.desktopAction;
    const visitMap={files:"files",pc:"pc",keyboard:"keyboard",trash:"trash"};
    if(visitMap[a]) desktopDiscoverVisited.add(visitMap[a]);
    if(a==="files") desktopOpenApp="explorer";
    if(a==="pc") desktopOpenApp="pc";
    if(a==="keyboard") desktopOpenApp="keyboard";
    if(a==="trash") desktopOpenApp="trash";
    if(a==="search") desktopOpenApp="search";
    if(a==="start") desktopOpenApp="explorer";
    renderDesktopDiscoverActivity();
  });
  document.querySelectorAll("[data-desktop-nav]").forEach(b=>b.onclick=()=>{
    const target=b.dataset.desktopNav;
    if(target==="up"){
      if(desktopView!=="root"){desktopView="root";desktopOpenApp="explorer";}
      else {desktopOpenApp="explorer";}
    }else{desktopView=target;desktopOpenApp="explorer";}
    renderDesktopDiscoverActivity();
  });
  document.querySelectorAll("[data-file-type]").forEach(b=>b.onclick=()=>{
    const type=b.dataset.fileType, name=b.dataset.fileName;
    if(type==="folder"){
      const folderMap={"Schoolwerk":"school","Foto's":"foto","Downloads":"downloads","Nederlands":"nederlands","Wiskunde":"school","WO":"school"};
      desktopView=folderMap[name]||"root";
      desktopOpenApp="explorer";
      renderDesktopDiscoverActivity();
    }else{
      notify(`Bestand geopend: ${name}`);
    }
  });
  document.querySelectorAll("[data-search-file]").forEach(b=>b.onclick=()=>{
    notify(`Gevonden: ${b.dataset.searchFile}`);
    desktopOpenApp="explorer";
    renderDesktopDiscoverActivity();
  });
  document.querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>{
    const key=b.dataset.key; const map={Enter:"Start een nieuwe regel.",Backspace:"Verwijdert het teken links van je cursor.",Shift:"Met Shift maak je bijvoorbeeld een hoofdletter.",Spatie:"Zet een spatie tussen woorden.",Tab:"Gaat naar het volgende vak of onderdeel.",Ctrl:"Gebruik je vaak samen met andere toetsen voor sneltoetsen."};
    document.getElementById("keyExplain").textContent=map[key]||`De toets ${key} gebruik je om tekst of opdrachten in te voeren.`;
  });
  document.querySelectorAll("[data-device]").forEach(b=>b.onclick=()=>{
    const key=b.dataset.device; const input=["keyboard","mouse","microphone"].includes(key); document.getElementById("deviceNote").innerHTML=`<b>${input?"Input":"Output"}</b> — ${b.querySelector("b").textContent} ${input?"stuurt informatie naar de computer.":"geeft informatie van de computer weer of af."}`;
  });
}
const desktopPracticeTasks=[
  {type:"device",q:"Je wilt letters typen op de computer. Welk apparaat heb je nodig?",a:["⌨️ Toetsenbord","🖥️ Scherm"],c:0,e:"Het toetsenbord is een inputapparaat: je geeft er informatie mee aan de computer."},
  {type:"key",q:"Je hebt `Hallo wereld` getypt en wilt een foutje links van je cursor verwijderen. Welke toets gebruik je?",a:["Backspace","Shift"],c:0,e:"Backspace verwijdert het teken links van je cursor."},
  {type:"folder",q:"Waar hoort `spreekbeurt.pptx` thuis?",a:["📁 Schoolwerk → Nederlands","🗑️ Prullenbak"],c:0,e:"Een spreekbeurt is schoolwerk en bewaar je in de juiste schoolmap."},
  {type:"file",q:"Je wilt een foto bekijken die al op je computer staat. Heb je internet nodig?",a:["Nee, niet als de foto lokaal is opgeslagen.","Ja, altijd."],c:0,e:"Een bestand dat al op je computer staat, kun je offline openen."},
  {type:"device",q:"Welk apparaat geeft geluid van de computer weer?",a:["🔊 Luidsprekers","🎙️ Microfoon"],c:0,e:"Luidsprekers zijn output: ze geven informatie van de computer weer."},
  {type:"folder",q:"Je wilt `boekbespreking.docx` terugvinden. Welke map is logisch?",a:["📁 Schoolwerk → Nederlands","📁 Downloads"],c:0,e:"Een boekbespreking is Nederlands schoolwerk."}
];
function desktopPractice(){
  const q=desktopPracticeTasks[desktopPracticeIndex];
  card("📁 Inoefenen",`Opdracht ${desktopPracticeIndex+1} van ${desktopPracticeTasks.length} · Gebruik je digitale computer.`);
  const visual=q.type==="folder"?`<div class="practice-desktop-mini">🖥️ <span>📁 Schoolwerk</span> <span>📄 ${q.q.includes("spreek")?"spreekbeurt.pptx":"boekbespreking.docx"}</span></div>`:"";
  document.getElementById("box").innerHTML=`<div class="desktop-practice"><div class="desktop-task-card"><p class="desktop-kicker">DOE DIT OP JE BUREAUBLAD</p><div class="practice-scenario">${q.q}</div>${visual}<div class="answers">${q.a.map((a,i)=>`<button class="answer" data-dp="${i}">${a}</button>`).join("")}</div><div id="desktopFeedback"></div></div>${desktopShell(`<div class="desktop-mini-window"><div class="mini-titlebar">📁 Bestanden <span>×</span></div><div class="mini-files">📁 Schoolwerk &nbsp;&nbsp; 📁 Foto's &nbsp;&nbsp; 📁 Downloads</div><div class="mini-files">📄 planning.docx &nbsp;&nbsp; 🖼️ klasfoto.jpg</div></div>`)}</div>`;
  document.querySelectorAll("[data-dp]").forEach(x=>x.onclick=()=>{
    const f=document.getElementById("desktopFeedback");
    if(+x.dataset.dp===q.c){document.querySelectorAll("[data-dp]").forEach(b=>b.disabled=true);f.innerHTML=`<div class="feedback good">✅ Juist! ${q.e}</div><button class="next" id="desktopNext">${desktopPracticeIndex===desktopPracticeTasks.length-1?"Naar Beheersing →":"Volgende →"}</button>`;document.getElementById("desktopNext").onclick=()=>{desktopPracticeIndex++;desktopPracticeIndex===desktopPracticeTasks.length?nextStage():desktopPractice();};}
    else f.innerHTML=`<div class="feedback bad">❌ Nog niet. Kijk goed naar de vraag en probeer opnieuw.</div>`;
  });
}
const desktopMasteryTasks=[
  {q:"Je moet een spreekbeurt voorbereiden. Eerst kies je het juiste apparaat om tekst te typen. Daarna bewaar je het bestand in de juiste map. Welke aanpak klopt?",a:["⌨️ Toetsenbord → 📁 Schoolwerk → 📁 Nederlands","🖥️ Scherm → 🗑️ Prullenbak"],c:0,e:"Je gebruikt het toetsenbord als input en bewaart je bestand in de juiste mappenstructuur."},
  {q:"Je krijgt `klasfoto.jpg` van je leerkracht en wilt ze later zonder internet bekijken. Wat doe je?",a:["Je bewaart het bestand op je computer.","Je moet de foto online laten staan."],c:0,e:"Een lokaal opgeslagen bestand kun je ook offline bekijken."},
  {q:"Je merkt dat `boekbespreking.docx` in Downloads staat, maar het hoort bij Nederlands. Wat doe je?",a:["Je verplaatst het naar Schoolwerk → Nederlands.","Je verwijdert het meteen."],c:0,e:"Een duidelijke mappenstructuur helpt je bestanden snel terug te vinden."},
  {q:"Je wilt een document afdrukken. Welk apparaat is output?",a:["🖨️ Printer","⌨️ Toetsenbord"],c:0,e:"De printer geeft het resultaat van de computer op papier weer."},
  {q:"Je maakt een typefout en wilt alleen de letter links van de cursor verwijderen. Welke toets past?",a:["Backspace","Spatie"],c:0,e:"Backspace verwijdert het teken links van de cursor."}
];
let desktopMasteryIndex=0;
function desktopMastery(){
  const q=desktopMasteryTasks[desktopMasteryIndex];
  card("🏆 Beheersing",`Digitale werkdag · opdracht ${desktopMasteryIndex+1} van ${desktopMasteryTasks.length}`);
  document.getElementById("box").innerHTML=`<div class="workday-card"><div class="workday-head"><span>🖥️</span><div><p class="desktop-kicker">DIGITALE WERKDAG</p><h3>Los het probleem op</h3></div></div><div class="practice-scenario">${q.q}</div><div class="answers">${q.a.map((a,i)=>`<button class="answer" data-dm="${i}">${a}</button>`).join("")}</div><div id="desktopMasteryFeedback"></div></div>`;
  document.querySelectorAll("[data-dm]").forEach(x=>x.onclick=()=>{const f=document.getElementById("desktopMasteryFeedback");if(+x.dataset.dm===q.c){document.querySelectorAll("[data-dm]").forEach(b=>b.disabled=true);f.innerHTML=`<div class="feedback good">✅ Juist! ${q.e}</div><button class="next" id="desktopMasteryNext">${desktopMasteryIndex===desktopMasteryTasks.length-1?"Missie voltooien →":"Volgende →"}</button>`;document.getElementById("desktopMasteryNext").onclick=()=>{desktopMasteryIndex++;desktopMasteryIndex===desktopMasteryTasks.length?nextStage():desktopMastery();}}else f.innerHTML=`<div class="feedback bad">❌ Nog niet. Denk opnieuw na over wat je op de computer zou doen.</div>`;});
}

/* MISSIE 2 — DENKEN ALS EEN COMPUTER */
const thinkingConcepts=[
  {icon:"🧠",title:"Algoritme",text:"Een reeks duidelijke stappen waarmee je een opdracht uitvoert of een probleem oplost.",
   example:"Een robot naar een schat sturen met duidelijke opdrachten."},
  {icon:"🔢",title:"Sequentie",text:"De volgorde waarin de stappen van een algoritme na elkaar worden uitgevoerd.",
   example:"Eerst brood nemen, daarna choco nemen en daarna smeren."},
  {icon:"🧩",title:"Decompositie",text:"Een grote opdracht opdelen in kleinere opdrachten of taken.",
   example:"Een schoolfeest opdelen in eten, muziek, versiering en activiteiten."},
  {icon:"👀",title:"Patroonherkenning",text:"Ontdekken wat hetzelfde blijft of steeds terugkomt.",
   example:"🔵 🟢 🔵 🟢 ..."},
  {icon:"🎯",title:"Abstractie",text:"Kijken naar de informatie die belangrijk is voor je opdracht en de rest weglaten.",
   example:"Bij het zoeken naar een bestand heb je de naam en de map nodig, niet de kleur van je computer."}
];
let thinkingIndex=0, thinkingRevealed=false;

function discoverThinking(){
  if(thinkingIndex===0 && !thinkingRevealed){} 
  card("🤖 Ontdek & leer","Ontdek vijf manieren om als een computer te denken. Klik op een kaart en leer het begrip kennen.");
  renderThinkingCard();
}
function renderThinkingCard(){
  const c=thinkingConcepts[thinkingIndex], box=document.getElementById("box");
  const isSequence=c.title==="Sequentie";
  const extra=isSequence
    ? `<div class="thinking-contrast"><b>Belangrijk verschil</b><span><strong>Algoritme</strong> = welke stappen heb ik nodig?</span><span><strong>Sequentie</strong> = in welke volgorde voer ik ze uit?</span></div>`
    : "";
  box.innerHTML=`
    <div class="discover-progress"><span>Begrip ${thinkingIndex+1} van 5</span><div class="discover-dots">${thinkingConcepts.map((_,i)=>`<i class="${i===thinkingIndex?"active":i<thinkingIndex?"done":""}"></i>`).join("")}</div></div>
    <div class="concept-wrap">
      <button class="concept-flip concept-blue ${thinkingRevealed?"revealed":""}" id="thinkingFlip">
        <span class="concept-face concept-front">
          <span class="concept-icon">${c.icon}</span><span class="concept-label">Ontdek het begrip</span>
          <strong>${c.title}</strong><span class="concept-hint">Klik om te ontdekken →</span>
        </span>
        <span class="concept-face concept-back">
          <span class="concept-icon">${c.icon}</span><span class="concept-reveal-label">Dit betekent...</span>
          <strong>${c.title}</strong><span class="concept-definition">${c.text}</span>
          <span class="concept-example"><b>Voorbeeld:</b> ${c.example}</span>${extra}
        </span>
      </button>
    </div>
    <div class="discover-action">
      ${thinkingRevealed?`<button class="next" id="thinkingNext">${thinkingIndex===4?"Alle begrippen ontdekt →":"Volgend begrip →"}</button>`:`<p>💡 Klik op de kaart om het begrip te ontdekken.</p>`}
    </div>`;
  document.getElementById("thinkingFlip").onclick=()=>{if(!thinkingRevealed){thinkingRevealed=true;renderThinkingCard();}};
  if(thinkingRevealed) document.getElementById("thinkingNext").onclick=()=>{
    if(thinkingIndex<4){thinkingIndex++;thinkingRevealed=false;renderThinkingCard();}
    else {thinkingIndex=0;thinkingRevealed=false;nextStage();}
  };
}

const tq=[
 {q:"Welke zin beschrijft een algoritme?",a:["Een reeks duidelijke stappen om iets uit te voeren.","Alleen de volgorde van die stappen."],c:0,e:"Een algoritme bevat duidelijke stappen om een opdracht uit te voeren of een probleem op te lossen."},
 {q:"Wat betekent sequentie?",a:["Een groot probleem opdelen in kleine problemen.","De volgorde waarin stappen na elkaar worden uitgevoerd."],c:1,e:"Sequentie gaat over de volgorde van de stappen."},
 {q:"Een schoolfeest opdelen in eten, muziek en versiering. Welk begrip past?",a:["Decompositie","Abstractie"],c:0,e:"Je deelt een grote opdracht op in kleinere taken."},
 {q:"🔵 🟢 🔵 🟢 ❓ Wat komt hierna?",a:["🟢","🟡"],c:0,e:"Je herkent het patroon blauw-groen-blauw-groen."},
 {q:"Je zoekt een bestand. Welke informatie is het meest belangrijk?",a:["De naam van het bestand en de map.","De kleur van je computer."],c:0,e:"Je houdt alleen de informatie die nodig is voor je opdracht."},
 {q:"Welke hoort bij sequentie?",a:["Brood nemen → choco nemen → smeren.","Een schoolfeest opdelen in kleinere taken."],c:0,e:"Sequentie gaat over de volgorde."},
 {q:"Een robot moet naar een schat. Je maakt eerst een reeks duidelijke opdrachten. Wat maak je?",a:["Een algoritme","Een patroon"],c:0,e:"De reeks duidelijke opdrachten vormt het algoritme."},
 {q:"Je verdeelt een groot probleem in vier kleinere problemen. Wat doe je?",a:["Decompositie","Sequentie"],c:0,e:"Je gebruikt decompositie wanneer je een grote opdracht opdeelt."}
];
function practiceThinking(){
  const q=tq[s.practice];
  card("🧩 Inoefenen",`Vraag ${s.practice+1} van ${tq.length} · Denk goed na over het juiste begrip.`);
  document.getElementById("box").innerHTML=`
    <div class="practice-scenario">${q.q}</div>
    <div class="answers">${q.a.map((a,i)=>`<button class="answer" data-t="${i}">${a}</button>`).join("")}</div><div id="tfb"></div>`;
  document.querySelectorAll("[data-t]").forEach(x=>x.onclick=()=>{
    const f=document.getElementById("tfb");
    if(+x.dataset.t===q.c){
      s.practiceScore++;document.querySelectorAll("[data-t]").forEach(b=>b.disabled=true);
      f.innerHTML=`<div class="feedback good">✅ Juist! ${q.e}</div><button class="next" id="tnext">${s.practice===tq.length-1?"Naar Beheersing →":"Volgende →"}</button>`;
      document.getElementById("tnext").onclick=()=>{s.practice++;s.practice===tq.length?nextStage():practiceThinking();};
    }else f.innerHTML=`<div class="feedback bad">❌ Nog niet. Lees de begrippen nog eens rustig na.</div>`;
  });
}
const tmq=[
 {q:"Je moet een robot naar een schat sturen. Je bedenkt de stappen, zet ze in de juiste volgorde en test ze. Wat doe je?",a:["Een algoritme ontwerpen en testen.","Alleen een patroon zoeken."],c:0},
 {q:"Een grote opdracht wordt verdeeld in vier kleinere opdrachten. Welk principe gebruik je?",a:["Decompositie","Sequentie"],c:0},
 {q:"Je merkt dat de robot steeds dezelfde twee bewegingen nodig heeft. Wat herken je?",a:["Een patroon","Een ontvanger"],c:0},
 {q:"Je hebt een robotopdracht. Welke informatie heb je vooral nodig?",a:["De start, het doel en de obstakels.","De kleur van de tafel."],c:0},
 {q:"Een stappenreeks werkt niet. Je verandert één stap en test opnieuw. Wat doe je?",a:["Debuggen en verbeteren.","De opdracht negeren."],c:0},
 {q:"Welke uitspraak is juist?",a:["Een algoritme bestaat uit duidelijke stappen; sequentie gaat over hun volgorde.","Een sequentie is een grote opdracht die je opsplitst."],c:0},
 {q:"Welke aanpak past bij decompositie?",a:["Een groot probleem opdelen in kleinere taken.","Alle informatie tegelijk proberen te gebruiken."],c:0},
 {q:"Waarom is abstractie handig?",a:["Je houdt de informatie over die nodig is om het probleem op te lossen.","Je voegt zoveel mogelijk extra informatie toe."],c:0}
];
function masteryThinking(){
  const q=tmq[s.mastery];
  card("🏆 Beheersing",`Opdracht ${s.mastery+1} van ${tmq.length} · Alles komt door elkaar.`);
  document.getElementById("box").innerHTML=`
    <div class="practice-scenario">${q.q}</div>
    <div class="answers">${q.a.map((a,i)=>`<button class="answer" data-m="${i}">${a}</button>`).join("")}</div><div id="mfb"></div>`;
  document.querySelectorAll("[data-m]").forEach(x=>x.onclick=()=>{
    const f=document.getElementById("mfb");
    if(+x.dataset.m===q.c){
      s.masteryScore++;document.querySelectorAll("[data-m]").forEach(b=>b.disabled=true);
      f.innerHTML=`<div class="feedback good">✅ Juist!</div><button class="next" id="mnext">${s.mastery===tmq.length-1?"Missie voltooien →":"Volgende →"}</button>`;
      document.getElementById("mnext").onclick=()=>{s.mastery++;s.mastery===tmq.length?nextStage():masteryThinking();};
    }else f.innerHTML=`<div class="feedback bad">❌ Nog niet. Denk na over welk principe hier wordt gebruikt.</div>`;
  });
}


/* 4 — ROBOTMISSIE */
const robotLevels=[
  {
    title:"Level 1 · Eén kristal",
    intro:"Maak een algoritme dat Robo naar het kristal brengt. Let goed op de volgorde van je pijlen.",
    size:5,
    start:[4,0],
    crystals:[[4,3]],
    exit:[4,4],
    walls:[[3,1],[3,2],[2,2]],
    tip:"Begin met plannen: waar staat Robo en waar ligt het kristal?"
  },
  {
    title:"Level 2 · Twee kristallen",
    intro:"Verzamel beide kristallen en bereik daarna de uitgang. Deel het probleem op in kleine stukken.",
    size:5,
    start:[4,0],
    crystals:[[1,1],[3,3]],
    exit:[0,4],
    walls:[[3,0],[3,1],[2,1],[1,3],[2,3]],
    tip:"Denk eerst: kristal 1 → kristal 2 → uitgang. Dat is decompositie."
  },
  {
    title:"Level 3 · De grote robotmissie",
    intro:"Verzamel alle kristallen en bereik de uitgang. Test je algoritme en verbeter het als Robo vastloopt.",
    size:6,
    start:[5,0],
    crystals:[[5,2],[2,2],[1,5]],
    exit:[0,5],
    walls:[[4,1],[4,3],[3,3],[2,3],[2,4],[1,1],[1,2],[3,5]],
    tip:"Gebruik alles: plan, herken patronen, houd alleen belangrijke informatie bij en debug je route."
  }
];
const robotDirs={up:[-1,0,"↑"],down:[1,0,"↓"],left:[0,-1,"←"],right:[0,1,"→"]};

function robotMission(){
  if(!Number.isInteger(s.robotLevel)) s.robotLevel=0;
  if(!Array.isArray(s.robotCommands)) s.robotCommands=[];
  const level=robotLevels[s.robotLevel];
  card("🤖 Robotmissie",`${level.title} · ${level.intro}`);
  renderRobotBoard(level);
}

function renderRobotBoard(level, result="", robotPos=null, activeStep=-1){
  const box=document.getElementById("box");
  const commands=s.robotCommands||[];
  const pos=robotPos ? [...robotPos] : [...level.start];

  let cells="";
  for(let r=0;r<level.size;r++){
    for(let c=0;c<level.size;c++){
      const isRobot=r===pos[0]&&c===pos[1];
      const isExit=r===level.exit[0]&&c===level.exit[1];
      const wall=level.walls.some(p=>p[0]===r&&p[1]===c);
      const crystal=level.crystals.some(p=>p[0]===r&&p[1]===c);

      cells+=`<div class="robot-cell ${wall?"wall":""} ${isExit?"exit":""} ${isRobot?"robot-here":""}">
        ${wall?"":(isRobot?"🤖":(crystal?"💎":(isExit?"🏁":"")))}
      </div>`;
    }
  }

  box.innerHTML=`
    <div class="robot-top">
      <div><b>Kristallen:</b> ${level.crystals.length}</div>
      <div><b>Jouw stappen:</b> ${commands.length}</div>
    </div>

    <div class="robot-grid-play" style="--robot-size:${level.size}">${cells}</div>

    <div class="robot-command-title">Bouw je algoritme</div>
    <div class="robot-command-row">
      ${["up","left","down","right"].map(d=>`<button class="robot-key" data-dir="${d}" title="Voeg ${robotDirs[d][2]} toe">${robotDirs[d][2]}</button>`).join("")}
    </div>

    <div class="robot-sequence">
      ${commands.length
        ? commands.map((d,i)=>`<span class="${i<activeStep?"executed":i===activeStep?"current":""}" data-step="${i}">${robotDirs[d][2]}</span>`).join("")
        : "<em>Kies pijlen om je stappenreeks te maken.</em>"}
    </div>

    <div class="robot-step-status" id="robotStepStatus">
      ${activeStep>=0 && activeStep<commands.length
        ? `Robo voert <b>stap ${activeStep+1}</b> van ${commands.length} uit.`
        : "Je algoritme staat klaar om getest te worden."}
    </div>

    <div class="robot-actions">
      <button class="back" id="robotClear">Wis</button>
      <button class="back" id="robotUndo">↶ Eén stap terug</button>
      <button class="next" id="robotRun">▶ Test je algoritme</button>
    </div>

    <div class="robot-tip">💡 ${level.tip}</div>
    <div id="robotFeedback">${result}</div>
  `;

  document.querySelectorAll(".robot-key").forEach(b=>b.onclick=()=>{
    if(commands.length<40){
      s.robotCommands.push(b.dataset.dir);
      renderRobotBoard(level);
    }
  });
  document.getElementById("robotClear").onclick=()=>{s.robotCommands=[];renderRobotBoard(level)};
  document.getElementById("robotUndo").onclick=()=>{s.robotCommands.pop();renderRobotBoard(level)};
  document.getElementById("robotRun").onclick=()=>runRobot(level);
}


async function runRobot(level){
  const commands=[...(s.robotCommands||[])];
  if(!commands.length){
    renderRobotBoard(level,`<div class="feedback bad">🤔 Kies eerst minstens één stap voor Robo.</div>`);
    return;
  }

  // Disable controls while Robo is moving.
  document.querySelectorAll(".robot-key,#robotClear,#robotUndo,#robotRun").forEach(b=>b.disabled=true);

  const pos=[...level.start];
  const got=new Set();

  for(let i=0;i<commands.length;i++){
    const dir=commands[i];
    const [dr,dc]=robotDirs[dir];
    const nr=pos[0]+dr,nc=pos[1]+dc;

    // Highlight the command that is currently being executed.
    highlightRobotStep(i,"running");

    await new Promise(resolve=>setTimeout(resolve,550));

    if(nr<0||nc<0||nr>=level.size||nc>=level.size||level.walls.some(p=>p[0]===nr&&p[1]===nc)){
      highlightRobotStep(i,"failed");
      document.querySelectorAll(".robot-key,#robotClear,#robotUndo,#robotRun").forEach(b=>b.disabled=false);
      renderRobotBoard(level,`<div class="feedback bad">🛠️ Robo botste bij stap ${i+1}. Kijk naar de gemarkeerde stap en pas je algoritme aan.</div>`);
      return;
    }

    pos[0]=nr;
    pos[1]=nc;

    level.crystals.forEach((p,j)=>{
      if(p[0]===pos[0]&&p[1]===pos[1]) got.add(j);
    });

    // Re-render the board with Robo in the new position and the executed step highlighted.
    renderRobotBoard(level,"",pos,i);
    await new Promise(resolve=>setTimeout(resolve,180));
  }

  const all=got.size===level.crystals.length;
  const atExit=pos[0]===level.exit[0]&&pos[1]===level.exit[1];

  if(!all){
    renderRobotBoard(level,`<div class="feedback bad">💎 Robo is aangekomen, maar nog niet alle kristallen zijn verzameld. Denk na over de kleinere deelproblemen.</div>`,pos,commands.length-1);
    return;
  }

  if(!atExit){
    renderRobotBoard(level,`<div class="feedback bad">💎 Alle kristallen zijn verzameld! Nu moet Robo nog naar de uitgang 🏁.</div>`,pos,commands.length-1);
    return;
  }

  if(s.robotLevel<robotLevels.length-1){
    s.robotLevel++;
    s.robotCommands=[];
    renderRobotSuccess(level);
  }else{
    done.add(4);
    renderRobotSuccess(level,true);
    updateProgress();
  }
}

function highlightRobotStep(index,state){
  document.querySelectorAll(".robot-sequence span").forEach((el,i)=>{
    el.classList.remove("current","failed","executed");
    if(i<index) el.classList.add("executed");
    if(i===index) el.classList.add(state);
  });
}


function renderRobotSuccess(level,final=false){
  const box=document.getElementById("box");
  box.innerHTML=`
    <div class="robot-success">
      <div class="complete-icon">✓</div>
      <p class="kicker">${final?"ALLE LEVELS VOLTOOID":"LEVEL VOLTOOID"}</p>
      <h2>${final?"🤖 Robotmissie geslaagd!":"🎉 Goed gedaan!"}</h2>
      <p>${final?"Je hebt gepland, een algoritme gemaakt, de sequentie gebruikt, problemen opgesplitst, patronen herkend en je oplossing getest.":"Je algoritme werkte! Klaar voor het volgende level?"}</p>
      <button class="next" id="robotNext">${final?"Missie voltooien →":"Volgend robotlevel →"}</button>
    </div>`;
  document.getElementById("robotNext").onclick=()=>{
    if(final){ renderMissionComplete(); }
    else { render(); }
  };
}

/* 2 — INOEFENEN: echte afgebakende situaties */



const pq=[
  {q:"Emma stuurt een foto naar Milan. Wie is de verzender?",a:["Emma","Milan"],c:0},
  {q:"Emma stuurt een foto naar Milan. Wie is de ontvanger?",a:["Emma","Milan"],c:1},
  {q:"Lotte stuurt een bericht naar Noor. Wie is de verzender?",a:["Lotte","Noor"],c:0},
  {q:"Lotte stuurt een bericht naar Noor. Wie is de ontvanger?",a:["Lotte","Noor"],c:1},
  {q:"Je opent een website om informatie te zoeken. Online of offline?",a:["Online","Offline"],c:0},
  {q:"Je speelt een spel waarvoor je geen internet nodig hebt. Online of offline?",a:["Online","Offline"],c:1},
  {q:"Noor krijgt een foto van Lotte. Wie is de ontvanger?",a:["Lotte","Noor"],c:1},
  {q:"Je luistert naar een liedje dat al op je tablet staat. Online of offline?",a:["Online","Offline"],c:1},
  {q:"Milan ontvangt een bericht van Sara. Wie is de verzender?",a:["Milan","Sara"],c:1},
  {q:"Lotte stuurt via internet een foto naar Noor. Wie is de ontvanger?",a:["Lotte","Noor"],c:1}
];

function practice(){
  const q=pq[s.practice];
  card("🧩 Inoefenen",`Vraag ${s.practice+1} van ${pq.length} · Kies het juiste antwoord.`);
  document.getElementById("box").innerHTML=`
    <div class="practice-scenario">${q.q}</div>
    <div class="answers">${q.a.map((a,i)=>`<button class="answer" data-p="${i}">${a}</button>`).join("")}</div>
    <div id="pfb"></div>
  `;
  document.querySelectorAll("[data-p]").forEach(x=>x.onclick=()=>{
    const f=document.getElementById("pfb");
    if(+x.dataset.p===q.c){
      s.practiceScore++;
      document.querySelectorAll("[data-p]").forEach(b=>b.disabled=true);
      f.innerHTML=`<div class="feedback good">✅ Juist!</div><button class="next" id="pnext">${s.practice===pq.length-1?"Naar Beheersing →":"Volgende →"}</button>`;
      document.getElementById("pnext").onclick=()=>{
        s.practice++;
        s.practice===pq.length?nextStage():practice();
      };
    }else{
      f.innerHTML=`<div class="feedback bad">❌ Nog niet. Kijk goed naar wie iets verstuurt, ontvangt of internet gebruikt.</div>`;
    }
  });
}

/* 4 — BEHEERSING: alles door elkaar + iets moeilijker */
const mq=[
  {q:"Emma stuurt via het internet een foto naar haar papa. Welke zin klopt?",a:["Emma is de verzender en papa is de ontvanger.","Papa is de verzender en Emma is de ontvanger."],c:0},
  {q:"Lars krijgt een bericht van Noor. Wie is de verzender?",a:["Lars","Noor"],c:1},
  {q:"Milan opent een website om informatie te zoeken. Wat klopt?",a:["Milan is offline.","Milan is online."],c:1},
  {q:"Sara bekijkt een foto die al op haar tablet staat. Wat klopt?",a:["Sara heeft geen internet nodig om de foto te bekijken.","Sara moet internet gebruiken om de foto te bekijken."],c:0},
  {q:"Tom stuurt via het internet een bericht naar zijn oma. Wie ontvangt het bericht?",a:["Tom","Zijn oma"],c:1},
  {q:"Noor speelt een spel zonder internet. Ze krijgt geen online bericht en gebruikt geen website. Wat klopt?",a:["Noor is offline.","Noor is online."],c:0},
  {q:"De juf stuurt een bericht naar de klas via het internet. Welke combinatie klopt?",a:["De juf = verzender · de klas = ontvanger · online", "De klas = verzender · de juf = ontvanger · offline"],c:0},
  {q:"Welke situatie is online?",a:["Een filmpje bekijken dat al op je tablet staat.","Een website openen om iets op te zoeken."],c:1}
];

function mastery(){
  if(s.mastery===mq.length){
    done=new Set([1,2,3]);
    updateProgress();
    renderMissionComplete();
    return;
  }

  const q=mq[s.mastery];
  card("🏆 Beheersing",`Vraag ${s.mastery+1} van ${mq.length} · Alles kan door elkaar komen.`);
  document.getElementById("box").innerHTML=`
    <div class="practice-scenario">${q.q}</div>
    <div class="answers">${q.a.map((a,i)=>`<button class="answer" data-mq="${i}">${a}</button>`).join("")}</div>
    <div id="mfb"></div>
  `;
  document.querySelectorAll("[data-mq]").forEach(x=>x.onclick=()=>{
    const f=document.getElementById("mfb");
    document.querySelectorAll("[data-mq]").forEach(b=>b.disabled=true);
    if(+x.dataset.mq===q.c){
      s.masteryScore++;
      f.innerHTML=`<div class="feedback good">✅ Juist!</div>`;
    }else{
      f.innerHTML=`<div class="feedback bad">❌ Niet juist. Het goede antwoord is <strong>${q.a[q.c]}</strong>.</div>`;
    }
    f.innerHTML+=`<button class="next" id="mnext">${s.mastery===mq.length-1?"Resultaat bekijken →":"Volgende →"}</button>`;
    document.getElementById("mnext").onclick=()=>{s.mastery++;mastery()};
  });
}

showPage("home");
