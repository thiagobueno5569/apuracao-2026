/* Extras: guia de uso, contador de visualizações e contagem regressiva da atualização */
(function(){
  "use strict";
  var $=function(id){return document.getElementById(id)};
  var st=document.createElement("style");
  st.textContent=
    "a.btn{font:600 13px var(--body);border:1px solid var(--line);border-radius:10px;padding:8px 12px;cursor:pointer;line-height:1.2}"+
    "svg.map{touch-action:manipulation}"+
    ".howto{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:2px 0 12px}"+
    "@media (max-width:620px){.howto{grid-template-columns:1fr}}"+
    ".howto div{display:flex;gap:10px;align-items:flex-start;background:var(--chip);border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.35;min-width:0}"+
    ".howto b.n{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:var(--bg);font:700 13px var(--body)}"+
    ".howto strong{display:block;font-size:13.5px}"+
    ".pill .next{font-weight:500;color:var(--muted)}"+
    ".pill.views{color:var(--ink)} .pill.views svg{width:15px;height:15px;flex:none}"+
    ".munhint{margin:2px 0 8px;font-size:13px;background:var(--chip);border-radius:10px;padding:8px 10px}";
  document.head.appendChild(st);

  /* 1. Guia de uso acima do mapa */
  var map=$("map");
  if(map){
    var how=document.createElement("div");how.className="howto";
    how.innerHTML=
      '<div><b class="n">1</b><span><strong>Clique em um estado</strong>para ver porcentagens, votos e urnas apuradas.</span></div>'+
      '<div><b class="n">2</b><span><strong>Clique duas vezes</strong>no estado para abrir o mapa de todos os municípios.</span></div>'+
      '<div><b class="n">3</b><span><strong>Escolha uma cidade</strong>e toque em “Ver cada seção eleitoral” para ver quem venceu em cada urna.</span></div>';
    map.parentNode.insertBefore(how,map);
  }
  /* dica dentro do painel de municípios */
  var bar=document.querySelector(".munbar");
  if(bar){
    var h=document.createElement("p");h.className="munhint";
    h.innerHTML="Clique numa cidade no mapa ou na lista abaixo. Depois toque em <b>Ver cada seção eleitoral (urna)</b> para ver a cor de cada urna.";
    bar.parentNode.insertBefore(h,bar);
  }

  /* 2. Contagem regressiva até a próxima atualização (só quando está ao vivo) */
  var pill=$("pill"), txt=$("pillTxt"), next=document.createElement("span"), left=30;
  next.className="next";
  if(pill&&txt){
    pill.appendChild(next);
    new MutationObserver(function(){left=30}).observe(txt,{childList:true,characterData:true,subtree:true});
    setInterval(function(){
      if(!pill.classList.contains("live")){next.textContent="";return}
      left=Math.max(0,left-1);
      next.textContent=left>0?" · atualiza em "+left+"s":" · atualizando…";
    },1000);
  }

  /* Seções: aceitar urnas já recebidas (durante a apuração o TSE marca como "Recebido" antes de "Totalizado") */
  if(typeof window.secResult==="function"&&typeof URNA!=="undefined"){
    window.secResult=async function(u,mcd,z,s){
      var base=URNA+"dados/"+u+"/"+mcd+"/"+z+"/"+s+"/", aux;
      try{aux=await getJ(base+"p003221-"+u+"-m"+mcd+"-z"+z+"-s"+s+"-aux.json?t="+Date.now())}catch(e){return null}
      var hs=(aux.hashes||[]).filter(function(x){return !/exclu|rejeit|cancel|anula|substitu/i.test(x.st||"")&&(x.arq||[]).some(function(a){return a.tp==="bu"})});
      var h=hs[hs.length-1]; if(!h) return null;
      var f=h.arq.filter(function(a){return a.tp==="bu"})[0];
      var r=await fetch(base+h.hash+"/"+f.nm,{cache:"no-store"}); if(!r.ok) return null;
      return derVotes(await r.arrayBuffer());
    };
  }

  /* 3. Contador de visualizações (público, sem cadastro) */
  var NS="https://abacus.jasoncameron.dev/", KEY="thiagobueno5569-apuracao2026/visitas";
  var box=document.querySelector(".status");
  if(!box) return;
  var v=document.createElement("span");v.className="pill views";v.hidden=true;
  v.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg><span id="viewsN"></span>';
  box.insertBefore(v,box.firstChild);
  function show(n){if(typeof n!=="number")return;v.hidden=false;$("viewsN").textContent=n.toLocaleString("pt-BR")+(n===1?" visualização":" visualizações")}
  function get(path){return fetch(NS+path+"?t="+Date.now(),{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){show(j.value)})}
  var counted=false;try{counted=sessionStorage.getItem("contou")==="1"}catch(e){}
  (counted?get("get/"+KEY):get("hit/"+KEY).then(function(){try{sessionStorage.setItem("contou","1")}catch(e){}}))
    .then(function(){setInterval(function(){get("get/"+KEY).catch(function(){})},60000)})
    .catch(function(){v.hidden=true});
})();
