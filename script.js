var G={money:0,influencer:false,sold:0,merit:0,donations:{},pray:0,stage:'idle',wait:0,patience:0,timer:null,selected:{}};
var WAIT_N=15,WAIT_I=5,CHOOSE_TIME=300,INF_COST=10000000,PRAY_REDUCE=2;
var INGS=[{id:'masala',n:'มาซาล่า',e:'🌶️'},{id:'sharkfin',n:'หูฉลาม',e:'🦈'},{id:'egg',n:'ไข่',e:'🥚'},{id:'tapo',n:'ตับอี้หวา',e:'🍢'},{id:'beefbase',n:'เนื้อเบส',e:'🥩'},{id:'jack',n:'เครื่องในแจ็ก',e:'🫀'},{id:'plara',n:'ปลาร้า',e:'🐟'},{id:'pork',n:'หมู',e:'🐷'},{id:'beef',n:'เนื้อ',e:'🐮'}];
var FACES=['🧑','👩','🧔','👧','👦','🧓','👩‍🦰','🧑‍🎤','👩‍🍳','🧑‍🚀'];
var PEOPLE=[{id:'kit',name:'กิต',emoji:'🧑‍💼',desc:'เปิดร้านใหม่ ขาดทุนอยู่ 🏪'},{id:'base',name:'เบส',emoji:'🎸',desc:'อยากซื้อกีตาร์ใหม่ 🎵'},{id:'iwa',name:'อี้หวา',emoji:'💸',desc:'เอาเงินไปเปิด OnlyFans 🔞'},{id:'jack',name:'แจ็ก',emoji:'🎮',desc:'อยากซื้อเกมใหม่ 🕹️'},{id:'naris',name:'นริศษา',emoji:'👩‍🎓',desc:'ค่าหนังสือเรียนเทอมนี้ 📚'}];

function $(id){return document.getElementById(id);}
function fmt(n){return Number(n).toLocaleString('en-US');}
function pick(a){return a[Math.floor(Math.random()*a.length)];}

function toast(msg){
  try{
    var d=document.createElement('div');
    d.className='toast';
    d.innerHTML=String(msg).replace(/\n/g,'<br>');
    document.body.appendChild(d);
    setTimeout(function(){d.remove();},2200);
  }catch(e){console.error(e);}
}

function showScreen(name){
  var ids=['intro','lobby','sell'];
  for(var i=0;i<ids.length;i++){
    var el=$('screen-'+ids[i]);
    if(el) el.style.display=(ids[i]===name?'block':'none');
  }
}

function save(){
  try{localStorage.setItem('roti_final',JSON.stringify({m:G.money,i:G.influencer,s:G.sold,merit:G.merit,don:G.donations,pray:G.pray}));}catch(e){}
}
function load(){
  try{
    var r=localStorage.getItem('roti_final');
    if(r){var o=JSON.parse(r);G.money=o.m||0;G.influencer=!!o.i;G.sold=o.s||0;G.merit=o.merit||0;G.donations=o.don||{};G.pray=o.pray||0;}
  }catch(e){}
}

function updateUI(){
  var a=$('moneyLobby'),b=$('moneySell'),c=$('soldCount'),d=$('meritLobby');
  if(a)a.textContent=fmt(G.money);
  if(b)b.textContent=fmt(G.money);
  if(c)c.textContent=fmt(G.sold);
  if(d)d.textContent=fmt(G.merit);
  var w=$('meritWallet');if(w)w.textContent=fmt(G.money);
  var wt=$('meritTotal');if(wt)wt.textContent=fmt(G.merit);
}

function fmtT(s){s=Math.max(0,s|0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function cnt(){var n=0;for(var k in G.selected)if(G.selected[k])n++;return n;}
function getWait(){var base=G.influencer?WAIT_I:WAIT_N;return Math.max(1,base-(G.pray>=1?PRAY_REDUCE:0));}

function updTimer(){
  var t=$('timerBox');if(!t)return;
  if(G.stage==='waiting')t.textContent='⏳ รอลูกค้าอีก '+G.wait+' วิ';
  else if(G.stage==='choosing')t.textContent='⏱️ '+fmtT(G.patience);
  else if(G.stage==='wrapping')t.textContent='🌀 กำลังห่อ...';
  else if(G.stage==='pricing')t.textContent='💰 ตั้งราคา';
  else t.textContent='⏱️ —';
}
function startT(){stopT();G.timer=setInterval(tick,1000);updTimer();}
function stopT(){if(G.timer){clearInterval(G.timer);G.timer=null;}}
function tick(){
  if(G.stage==='waiting'){G.wait--;if(G.wait<=0)arrive();}
  else if(G.stage==='choosing'){if(G.patience>0)G.patience--;}
  updTimer();
}

function startSell(){
  showScreen('sell');
  G.selected={};G.stage='waiting';G.wait=getWait();G.patience=0;
  var c=$('customer');if(c){c.classList.add('hidden');c.textContent='🧑';}
  var ca=$('chooseArea');if(ca)ca.classList.add('hidden');
  var wa=$('wrapArea');if(wa){wa.classList.add('hidden');wa.innerHTML='';}
  var pa=$('priceArea');if(pa)pa.classList.add('hidden');
  var bp=$('btnPut');if(bp)bp.classList.add('hidden');
  var st=$('sellStatus');
  if(st){
    var m='รอลูกค้า... ⏳';
    if(G.influencer&&G.pray>=1)m='รอลูกค้า... (อินฟลู + หลวงพ่อ 🙏✨)';
    else if(G.influencer)m='รอลูกค้า... (อินฟลู ✨)';
    else if(G.pray>=1)m='รอลูกค้า... (หลวงพ่อโชติ 🙏)';
    st.textContent=m;
  }
  startT();
}

function arrive(){
  G.stage='choosing';G.patience=CHOOSE_TIME;
  var c=$('customer');if(c){c.textContent=pick(FACES);c.classList.remove('hidden');}
  var st=$('sellStatus');if(st)st.textContent='ลูกค้ามาแล้ว! 🎉 จะใส่อะไรดี?';
  renderIngs();
  var ca=$('chooseArea');if(ca)ca.classList.remove('hidden');
  var bp=$('btnPut');if(bp)bp.classList.remove('hidden');
  updTimer();
}

function renderIngs(){
  var g=$('ingGrid');if(!g)return;g.innerHTML='';
  for(var i=0;i<INGS.length;i++){
    (function(ing){
      var b=document.createElement('button');
      b.type='button';
      b.className='ing'+(G.selected[ing.id]?' on':'');
      b.innerHTML='<span style="font-size:20px">'+ing.e+'</span><span>'+ing.n+'</span>';
      b.onclick=function(){
        if(G.stage!=='choosing')return;
        G.selected[ing.id]=!G.selected[ing.id];
        b.classList.toggle('on');
      };
      g.appendChild(b);
    })(INGS[i]);
  }
}

function putRoti(){
  if(G.stage!=='choosing')return;
  if(cnt()===0){var st=$('sellStatus');if(st)st.textContent='ใส่สักอย่างก่อนสิ! 😤';return;}
  G.stage='wrapping';stopT();updTimer();
  var ca=$('chooseArea');if(ca)ca.classList.add('hidden');
  var bp=$('btnPut');if(bp)bp.classList.add('hidden');
  var st=$('sellStatus');if(st)st.textContent='กำลังห่อโรตี... 🌀';
  var html='';
  for(var i=0;i<INGS.length;i++)if(G.selected[INGS[i].id])html+='<span class="chip">'+INGS[i].e+' '+INGS[i].n+'</span>';
  var wa=$('wrapArea');if(wa){wa.innerHTML=html;wa.classList.remove('hidden');}
  setTimeout(function(){
    if(wa)wa.classList.add('hidden');
    var s2=$('sellStatus');if(s2)s2.textContent='ยื่นให้ลูกค้าแล้ว! 🤲';
    G.stage='pricing';updTimer();
    var pa=$('priceArea');if(pa)pa.classList.remove('hidden');
    var pi=$('priceInput');if(pi){pi.value='';setTimeout(function(){pi.focus();},80);}
  },2000);
}

function charge(){
  if(G.stage!=='pricing')return;
  var pi=$('priceInput');
  var amt=pi?parseInt(pi.value,10):0;
  if(isNaN(amt)||amt<0)amt=0;amt=Math.floor(amt);
  G.money+=amt;G.sold+=1;save();updateUI();
  var pa=$('priceArea');if(pa)pa.classList.add('hidden');
  G.stage='done';
  var items=cnt()||1;var r;
  if(amt===0)r='ลูกค้า: ฟรีเหรอ?! 🥹';
  else if(amt<=items*15)r='ลูกค้า: ถูกจัง อร่อย 😋';
  else if(amt<=items*45)r='ลูกค้า: ราคาโอเค 🙂';
  else r='ลูกค้า: แพงไปป่ะ... แต่จ่าย 😭';
  var st=$('sellStatus');if(st)st.textContent=r+'  +'+fmt(amt)+' บาท';
  setTimeout(function(){G.stage='idle';G.selected={};showScreen('lobby');updTimer();},2200);
}

function openModal(id){var m=$(id);if(m)m.style.display='flex';}
function closeModal(id){var m=$(id);if(m)m.style.display='none';}

function openShop(){
  var b=$('btnBuyInflu');
  if(b){
    if(G.influencer){b.textContent='จ้างแล้ว ✅';b.disabled=true;}
    else{b.textContent='จ้างเลย 10,000,000 ฿';b.disabled=false;}
  }
  openModal('shopModal');
}
function closeShop(){closeModal('shopModal');}
function buy(){
  if(G.influencer){toast('จ้างไปแล้วน้า~');return;}
  if(G.money<INF_COST){toast('เงินไม่พอจ้า 🥞');return;}
  G.money-=INF_COST;G.influencer=true;save();updateUI();
  var b=$('btnBuyInflu');
  if(b){b.textContent='จ้างแล้ว ✅';b.disabled=true;}
  toast('จ้างอินฟลูสำเร็จ! ลูกค้ามาไวขึ้น ✨');
}

function openMerit(){renderMerit();openModal('meritModal');}
function closeMerit(){closeModal('meritModal');}
function renderMerit(){
  var w=$('meritWallet');if(w)w.textContent=fmt(G.money);
  var wt=$('meritTotal');if(wt)wt.textContent=fmt(G.merit);
  var list=$('meritList');if(!list)return;
  list.innerHTML='';
  for(var i=0;i<PEOPLE.length;i++){
    (function(p){
      var gave=(G.donations&&G.donations[p.id])||0;
      var div=document.createElement('div');div.className='person';
      var h='<div class="person-h"><div class="person-e">'+p.emoji+'</div>'+
            '<div><div class="person-n">'+p.name+'</div>'+
            '<div class="person-d">'+p.desc+'</div></div></div>';
      if(gave>0)h+='<div class="gave">🙏 เคยทำบุญ '+fmt(gave)+' บาท</div>';
      h+='<div class="row">'+
         '<input type="number" class="dinp" id="d_'+p.id+'" placeholder="จำนวนเงิน..." min="1">'+
         '<button type="button" class="dbtn" onclick="donate(\''+p.id+'\')">🙏 ทำบุญ</button>'+
         '<button type="button" class="dbtn alt" onclick="fillAll(\''+p.id+'\')">💰 ทั้งหมด</button>'+
         '</div>';
      div.innerHTML=h;
      list.appendChild(div);
    })(PEOPLE[i]);
  }
}
function fillAll(pid){
  if(G.money<=0){toast('ไม่มีเงินแล้วจ้า 💸');return;}
  var inp=$('d_'+pid);if(inp)inp.value=G.money;
}
function donate(pid){
  var p=null;
  for(var i=0;i<PEOPLE.length;i++)if(PEOPLE[i].id===pid){p=PEOPLE[i];break;}
  if(!p)return;
  var inp=$('d_'+pid);
  var amt=inp?parseInt(inp.value,10):0;
  if(isNaN(amt)||amt<=0){toast('ใส่จำนวนเงินก่อนจ้า 🙏');return;}
  if(G.money<amt){toast('เงินไม่พอจ้า (มี '+fmt(G.money)+') 💸');return;}
  G.money-=amt;G.merit+=amt;
  if(!G.donations)G.donations={};
  G.donations[pid]=(G.donations[pid]||0)+amt;
  save();updateUI();renderMerit();
  toast('ทำบุญให้'+p.name+' '+fmt(amt)+' บาท 🙏');
}

function openTemple(){renderTemple();openModal('templeModal');}
function closeTemple(){closeModal('templeModal');}
function renderTemple(){
  var base=G.influencer?WAIT_I:WAIT_N;
  var red=G.pray>=1?PRAY_REDUCE:0;
  $('thNow').textContent=getWait();
  $('thBase').textContent=base;
  $('thReduce').textContent=red;
  $('thInf').textContent=G.influencer?'จ้างแล้ว':'ยังไม่จ้าง';
  var done=G.pray>=1;
  $('thDone').classList.toggle('hidden',!done);
  var b=$('btnPray');
  if(b){b.disabled=done;b.style.display=done?'none':'block';}
}
function pray(){
  if(G.pray>=1){toast('ขอขมาไปแล้วน้า 🙏');return;}
  G.pray=1;save();renderTemple();
  toast('ขอขมาสำเร็จ 🙏\nรอลูกค้าลดลง 2 วิ');
}

load();updateUI();updTimer();
