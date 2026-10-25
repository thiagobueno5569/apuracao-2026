/* Faixa de vencedor: aparece quando o TSE declara eleito ou quando a vantagem fica impossível de virar */
(function(){
  "use strict";
  var URL0="https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br/br-c0001-e006258-u.json";
  var n=function(s){return parseFloat(String(s==null?"0":s).replace(/\./g,"").replace(",","."))||0};
  var N=function(v){return Math.round(v).toLocaleString("pt-BR")};
  var st=document.createElement("style");
  st.textContent=".winner{display:flex;gap:14px;align-items:center;border-radius:18px;padding:16px 18px;color:#fff;box-shadow:0 12px 30px -12px rgba(0,0,0,.4)}"+
    ".winner img{width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #fff;flex:none}"+
    ".winner .wt{font:800 clamp(26px,6vw,40px)/1 var(--display);text-transform:uppercase;letter-spacing:.01em}"+
    ".winner .ws{font-size:13.5px;opacity:.95;margin-top:4px;line-height:1.35}";
  document.head.appendChild(st);
  var box=document.createElement("section");box.className="winner";box.hidden=true;box.setAttribute("role","status");
  var score=document.querySelector(".score");
  if(score) score.parentNode.insertBefore(box,score);
  function check(){
    fetch(URL0+"?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.json()}).then(function(j){
      var c=[];(j.carg||[]).forEach(function(x){(x.agr||[]).forEach(function(a){(a.par||[]).forEach(function(p){(p.cand||[]).forEach(function(k){c.push(k)})})})});
      var L=c.filter(function(k){return k.n==="13"})[0]||{}, F=c.filter(function(k){return k.n==="22"})[0]||{};
      var lv=n(L.vap), fv=n(F.vap), resto=n((j.e||{}).esnt);
      var eleito=function(k){return k.e==="s"||(/eleito/i.test(k.st||"")&&!/n[aã]o/i.test(k.st||""))};
      var w=null, motivo="";
      if(eleito(L)) {w="L";motivo="Eleito segundo o TSE."}
      else if(eleito(F)) {w="F";motivo="Eleito segundo o TSE."}
      else if(lv+fv>0&&Math.abs(lv-fv)>resto){
        w=lv>fv?"L":"F";
        motivo="Matematicamente eleito: a vantagem é de "+N(Math.abs(lv-fv))+" votos e restam só "+N(resto)+" eleitores em urnas ainda não apuradas. Não dá mais para virar.";
      }
      if(!w){box.hidden=true;return}
      var lula=w==="L", foto=document.getElementById(lula?"fotoL":"fotoF");
      box.style.background="linear-gradient(120deg,var("+(lula?"--lula":"--flavio")+"),color-mix(in oklab,var("+(lula?"--lula":"--flavio")+") 60%,#000))";
      box.innerHTML=(foto&&foto.src?'<img alt="" src="'+foto.src+'">':"")+'<div><div class="wt">'+(lula?"Lula":"Flávio Bolsonaro")+' venceu</div><div class="ws"></div></div>';
      box.querySelector(".ws").textContent=motivo;
      box.hidden=false;
    }).catch(function(){});
  }
  check(); setInterval(check,60000);
})();
