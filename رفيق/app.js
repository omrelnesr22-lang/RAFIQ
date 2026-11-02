const K='rafiq_v1',$=s=>document.querySelector(s);
let S;try{S=JSON.parse(localStorage.getItem(K)||'null')}catch(e){}
S=S||{name:'',theme:'dark',tasks:[],prayers:{},habits:[],goals:[],reviews:{},vault:null,msg:{}};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast('تعذر الحفظ، مساحة التخزين ممتلئة')}};
const E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const id=()=>Math.random().toString(36).slice(2,9);
const dk=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>dk(new Date());
const addD=(d,n)=>{const x=new Date(d+'T00:00');x.setDate(x.getDate()+n);return dk(x)};
const ar=(d,o)=>new Date(d+'T00:00').toLocaleDateString('ar-EG',o||{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const P=[['fajr','الفجر'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']];
const CATS=['الدراسة','العمل','الأمور الشخصية','التطوير الذاتي','العبادات','أخرى'];
const PR=[['h','عالية'],['m','متوسطة'],['l','منخفضة']];
const STN={new:'لم تبدأ',prog:'قيد التنفيذ',done:'مكتملة',post:'مؤجلة',miss:'فائتة'};
const M={
done:['أحسنت! خطوة جديدة نحو أهدافك.','إنجاز جميل، استمر.','كل خطوة صغيرة تصنع فرقًا.','أنت تقترب مما تسعى إليه.','خطوة أخرى نحو ما تريد.'],
all:['ما شاء الله، أنهيت ما خططت له. تستحق أن تفخر بجهدك.'],
pray:['تقبل الله منك، وجعلها في ميزان حسناتك.','الحمد لله، بارك الله في وقتك.','نسأل الله لك القبول والثبات.','الحمد لله على نعمة الصلاة.','خطوة طيبة، تقبل الله طاعتك.'],
habit:['جميل أنك تحافظ على ما بدأت.','الاستمرار هو سر التغيير.','أنت تبني عادة جديدة، استمر.','أنت لا تنجز مهمة فقط، بل تبني عادة.'],
miss:['لم تكتمل هذه المهمة اليوم، لا بأس. يمكنك المحاولة مجددًا.','ليس كل يوم مثاليًا، وما زال بإمكانك ترتيب أولوياتك.','التعثر لا يعني النهاية.'],
hi:['كل يوم فرصة جديدة، وكل خطوة صغيرة تستحق التقدير.','لا يهم كم مضى، المهم أنك هنا الآن.','ابدأ بخطوة صغيرة، وسيتبعها الباقي.','خذ وقتك، وأعد ترتيب أولوياتك.']};
function pick(k){const a=M[k];let m;do{m=a[Math.floor(Math.random()*a.length)]}while(a.length>1&&m===S.msg[k]);S.msg[k]=m;return m}
let tt;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('s');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('s'),3200)}
function ask(title,F,cb,ok='حفظ'){const d=document.createElement('dialog');
d.innerHTML=`<form method="dialog"><h3>${title}</h3>${F.map(f=>`<label>${f.l}${f.t==='area'?`<textarea name="${f.k}" rows="5">${E(f.v)}</textarea>`:f.t==='sel'?`<select name="${f.k}">${f.o.map(o=>`<option value="${o[0]}"${o[0]==f.v?' selected':''}>${o[1]}</option>`).join('')}</select>`:`<input name="${f.k}" type="${f.t||'text'}" value="${E(f.v)}"${f.r?' required':''}>`}</label>`).join('')}<div class="row"><button class="b" value="ok">${ok}</button><button value="x" formnovalidate>إلغاء</button></div></form>`;
document.body.append(d);d.showModal();d.onclose=()=>{if(d.returnValue==='ok'){const o={};new FormData(d.querySelector('form')).forEach((v,k)=>o[k]=v.trim());cb(o)}d.remove()}}
/* ===== crypto (journal vault) ===== */
const te=new TextEncoder(),td=new TextDecoder();
const b2s=b=>{let s='';for(const x of new Uint8Array(b))s+=String.fromCharCode(x);return btoa(s)};
const s2b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function derive(pw,salt){const m=await crypto.subtle.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
let KEY=null,NOTES=[],jq='',jc='';
async function seal(){const iv=crypto.getRandomValues(new Uint8Array(12));const c=await crypto.subtle.encrypt({name:'AES-GCM',iv},KEY,te.encode(JSON.stringify(NOTES)));S.vault.iv=b2s(iv);S.vault.d=b2s(c);save()}
/* ===== helpers ===== */
let view='home',per='week',pd=today();
const NAV=[['home','⌂','الرئيسية'],['tasks','✓','يومي ومهامي'],['prayers','☪','صلواتي'],['habits','↻','عاداتي'],['journal','✎','مذكراتي'],['goals','★','أهدافي'],['review','☾','مراجعة اليوم'],['stats','▤','الإحصائيات'],['settings','⚙','الإعدادات']];
const eff=x=>x.st!=='done'&&x.d<today()?'miss':x.st;
const streak=h=>{let d=today(),n=0;if(!h.days.includes(d))d=addD(d,-1);while(h.days.includes(d)){n++;d=addD(d,-1)}return n};
const bar=p=>`<div class="bar"><i style="width:${p}%"></i></div>`;
const gp=g=>g.steps.length?Math.round(g.steps.filter(s=>s.done).length/g.steps.length*100):0;
const inR=d=>{const n=Math.round((new Date(today())-new Date(d))/864e5);return n>=0&&n<={day:0,week:6,month:29,year:364}[per]};
const tf=x=>[{k:'t',l:'عنوان المهمة',v:x.t,r:1},{k:'ds',l:'وصف (اختياري)',v:x.ds},{k:'d',l:'التاريخ',t:'date',v:x.d||today(),r:1},{k:'tm',l:'الوقت',t:'time',v:x.tm},{k:'pr',l:'الأولوية',t:'sel',o:PR,v:x.pr||'m'},{k:'c',l:'التصنيف',t:'sel',o:CATS.map(c=>[c,c]),v:x.c},{k:'rp',l:'التكرار',t:'sel',o:[['','بدون'],['d','يوميًا'],['w','أسبوعيًا']],v:x.rp}];
const taskHTML=x=>{const e=eff(x);return `<div class="tk ${e==='done'?'done':''}"><button class="${e==='done'?'ok':''}" data-a="td" data-i="${x.id}">${e==='done'?'✓':'○'}</button><div class="tt"><b>${E(x.t)}</b><div class="t2">${ar(x.d,{day:'numeric',month:'long'})}${x.tm?' · '+x.tm:''} · ${E(x.c)} · أولوية ${PR.find(p=>p[0]===x.pr)[1]}</div>${e==='miss'?`<div class="t2">${pick('miss')}</div>`:''}</div><span class="tag ${e}">${STN[e]}</span><select style="width:auto;margin:0" data-a="ts" data-i="${x.id}">${['new','prog','post'].map(s=>`<option value="${s}"${x.st===s?' selected':''}>${STN[s]}</option>`).join('')}</select><button data-a="tp" data-i="${x.id}">غدًا</button><button data-a="te" data-i="${x.id}">تعديل</button><button class="dn" data-a="tx" data-i="${x.id}">حذف</button></div>`};
/* ===== views ===== */
const V={
home(){const t=today(),tk=S.tasks.filter(x=>x.d===t),dn=tk.filter(x=>x.st==='done').length,pr=Object.keys(S.prayers[t]||{}).length,hb=S.habits.filter(h=>h.days.includes(t)).length,pc=Math.round((dn+pr+hb)/(tk.length+5+S.habits.length)*100),h=new Date().getHours();
const up=S.tasks.filter(x=>x.st!=='done'&&x.d>=t).sort((a,b)=>(a.d+(a.tm||'')).localeCompare(b.d+(b.tm||''))).slice(0,5),rv=S.reviews[t];
return `<div class="card"><div class="t2">${ar(t)}</div><h2>${h<12?'صباح الخير':h<17?'أهلًا بك مجددًا':'مساء الخير'}، ${E(S.name||'صديقي')}</h2><div>${pick('hi')}</div><div style="margin-top:12px">${bar(pc)}<div class="t2">تقدم اليوم ${pc}%</div></div></div>
<div class="grid" style="margin-bottom:14px"><div class="card" data-go="tasks"><b>${dn}</b>مهام مكتملة</div><div class="card" data-go="tasks"><b>${tk.length-dn}</b>مهام متبقية</div><div class="card" data-go="prayers"><b>${pr}/5</b>صلوات مسجلة</div><div class="card" data-go="habits"><b>${hb}/${S.habits.length}</b>عادات منجزة</div></div>
<div class="card"><h3>المهام القادمة</h3>${up.length?up.map(x=>`<div class="row sp"><span>${E(x.t)}</span><span class="t2">${ar(x.d,{day:'numeric',month:'short'})} ${x.tm||''} · ${PR.find(p=>p[0]===x.pr)[1]}</span></div>`).join(''):'<div class="empty">يبدو أن يومك ما زال مفتوحًا للإنجاز، أضف أول مهمة.</div>'}</div>
<div class="card"><h3>الصلوات</h3><div class="grid">${P.map(([k,n])=>{const s=(S.prayers[t]||{})[k];return `<div class="pr ${s||''}">${n}<div class="t2">${s==='on'?'في وقتها':s==='qada'?'قضاءً':'لم تسجل'}</div></div>`}).join('')}</div></div>
<div class="card" data-go="review" style="cursor:pointer"><h3>مراجعة اليوم</h3><div class="t2">${rv&&Object.values(rv).some(Boolean)?'بدأت مراجعة اليوم، اضغط للمتابعة':'لم تكتب مراجعة اليوم بعد'}</div></div>`},
tasks(){const l=S.tasks.slice().sort((a,b)=>a.d.localeCompare(b.d)),a=l.filter(x=>eff(x)!=='done'&&eff(x)!=='miss'),m=l.filter(x=>eff(x)==='miss'),d=l.filter(x=>x.st==='done');
return `<div class="row sp"><h2>يومي ومهامي</h2><button class="b" data-a="ta">+ مهمة جديدة</button></div>${!l.length?'<div class="empty">يبدو أن يومك ما زال مفتوحًا للإنجاز، أضف أول مهمة.</div>':''}
${a.length?`<h3>القادمة</h3>${a.map(taskHTML).join('')}`:''}${m.length?`<h3>الفائتة</h3>${m.map(taskHTML).join('')}`:''}${d.length?`<h3>المكتملة</h3>${d.map(taskHTML).join('')}`:''}`},
prayers(){const r=S.prayers[pd]||{};
return `<div class="row sp"><h2>صلواتي</h2><input type="date" value="${pd}" max="${today()}" data-a="pdate" style="width:auto;margin:0"></div><div class="t2" style="margin-bottom:10px">${ar(pd)}</div>
${P.map(([k,n])=>{const s=r[k];return `<div class="pr ${s||''}" style="margin-bottom:10px"><h3>${n}</h3><div class="t2">${s==='on'?'صليت في وقتها':s==='qada'?'صليت قضاءً':'لم يتم التسجيل'}</div><div class="row" style="justify-content:center;margin-top:8px"><button class="${s==='on'?'ok':''}" data-a="pr" data-i="${k}|on">في وقتها</button><button class="${s==='qada'?'b':''}" data-a="pr" data-i="${k}|qada">قضاءً</button>${s?`<button data-a="pr" data-i="${k}|">إلغاء التسجيل</button>`:''}</div></div>`}).join('')}
<div class="card"><h3>آخر 7 أيام</h3>${[0,1,2,3,4,5,6].map(i=>{const d=addD(today(),-i),x=S.prayers[d]||{};return `<div class="row sp"><span>${ar(d,{weekday:'long',day:'numeric',month:'short'})}</span><span>${P.map(([k])=>`<span class="dot ${x[k]?'y':''}"></span>`).join('')}</span></div>`}).join('')}</div>
<div class="t2">أوقات الصلاة تحتاج مصدر بيانات خارجيًا وإعداد المدينة، وهي غير مفعّلة في هذه النسخة.</div>`},
habits(){const t=today();
return `<div class="row sp"><h2>عاداتي</h2><button class="b" data-a="ha">+ عادة جديدة</button></div>${!S.habits.length?'<div class="empty">ابدأ بعادة صغيرة، فقد تصنع فرقًا كبيرًا.</div>':''}
${S.habits.map(h=>{const s=streak(h),wk=[6,5,4,3,2,1,0].map(i=>h.days.includes(addD(t,-i)));return `<div class="card"><div class="row sp"><div><b>${E(h.n)}</b><div class="t2">${E(h.ds||'')} · سلسلة ${s} يوم · هذا الأسبوع ${wk.filter(Boolean).length}/7${h.goal?` (الهدف ${h.goal})`:''}</div></div><div class="row"><button class="${h.days.includes(t)?'ok':''}" data-a="hd" data-i="${h.id}">${h.days.includes(t)?'✓ تم اليوم':'سجّل اليوم'}</button><button class="dn" data-a="hx" data-i="${h.id}">حذف</button></div></div><div style="margin-top:8px">${wk.map(y=>`<span class="dot ${y?'y':''}"></span>`).join('')}</div>${!h.days.includes(t)&&h.days.length&&s===0?`<div class="t2">لا بأس، يمكنك البدء من جديد. لا تجعل يومًا واحدًا يوقف رحلتك.</div>`:''}</div>`}).join('')}`},
journal(){
if(!S.vault)return `<h2>مذكراتي</h2><div class="card"><p>مذكراتك مشفّرة بالكامل على جهازك برمز سري، ولا يمكن استعادتها إذا نسيت الرمز.</p><button class="b" data-a="jset">إنشاء رمز القفل</button></div>`;
if(!KEY)return `<h2>مذكراتي</h2><div class="card"><p>هذه المساحة مقفلة.</p><button class="b" data-a="junl">فتح بالرمز السري</button></div>`;
return `<div class="row sp"><h2>مذكراتي</h2><div class="row"><button class="b" data-a="ja">+ مذكرة</button><button data-a="jpw">تغيير الرمز</button><button data-a="jlock">قفل</button></div></div><div class="row"><input id="jq" placeholder="بحث..." value="${E(jq)}" style="flex:2"><select id="jc" style="flex:1"><option value="">كل التصنيفات</option>${JC.map(c=>`<option${jc===c?' selected':''}>${c}</option>`).join('')}</select></div><div id="jl">${jl()}</div>`},
goals(){return `<div class="row sp"><h2>أهدافي</h2><button class="b" data-a="ga">+ هدف جديد</button></div>${!S.goals.length?'<div class="empty">ابدأ بهدف واحد واضح، وقسّمه إلى خطوات صغيرة.</div>':''}
${S.goals.map(g=>`<div class="card"><div class="row sp"><div><b>${E(g.t)}</b><div class="t2">${E(g.k)}${g.due?' · حتى '+ar(g.due,{day:'numeric',month:'long',year:'numeric'}):''}</div></div><button class="dn" data-a="gx" data-i="${g.id}">حذف</button></div>${bar(gp(g))}<div class="t2">${gp(g)}%</div>${g.steps.map((s,i)=>`<div class="row"><label style="margin:0;color:var(--tx)"><input type="checkbox" style="width:auto" ${s.done?'checked':''} data-a="gs" data-i="${g.id}|${i}"> ${E(s.x)}</label></div>`).join('')}<button data-a="gst" data-i="${g.id}" style="margin-top:8px">+ خطوة</button></div>`).join('')}`},
review(){const t=today(),r=S.reviews[t]||{},Q=[['a','ماذا أنجزت اليوم؟'],['b','ما أفضل شيء حدث اليوم؟'],['c','ما الشيء الذي أشعر بالامتنان له؟'],['d','ما الذي لم أستطع إنجازه؟'],['e','ماذا أريد تحسينه غدًا؟'],['f','ما أهم شيء أريد البدء به غدًا؟']];
return `<h2>مراجعة اليوم</h2><div class="t2" style="margin-bottom:10px">${ar(t)} · تُحفظ تلقائيًا</div>${Q.map(([k,q])=>`<div class="card"><label>${q}<textarea rows="3" data-rk="${k}">${E(r[k])}</textarea></label></div>`).join('')}<button class="b" data-a="rfin">إنهاء المراجعة</button>`},
stats(){const f=d=>inR(d),tk=S.tasks.filter(x=>f(x.d)),dn=tk.filter(x=>x.st==='done').length,ms=tk.filter(x=>eff(x)==='miss').length,ps=tk.filter(x=>x.st==='post').length;
let on=0,qa=0;Object.entries(S.prayers).forEach(([d,r])=>{if(f(d))Object.values(r).forEach(v=>v==='on'?on++:qa++)});
const days={'day':1,'week':7,'month':30,'year':365}[per],hr=S.habits.length?Math.round(S.habits.reduce((a,h)=>a+h.days.filter(f).length,0)/(S.habits.length*days)*100):0;
const gd=S.goals.filter(g=>gp(g)===100).length,avg=S.goals.length?Math.round(S.goals.reduce((a,g)=>a+gp(g),0)/S.goals.length):0;
const cnt=d=>S.tasks.filter(x=>x.da===d).length+Object.keys(S.prayers[d]||{}).length+S.habits.filter(h=>h.days.includes(d)).length;
const cells=[];for(let i=83;i>=0;i--){const n=cnt(addD(today(),-i));cells.push(`<i class="${n>5?'l3':n>2?'l2':n?'l1':''}" title="${n}"></i>`)}
return `<div class="row sp"><h2>الإحصائيات</h2><select data-a="per" style="width:auto;margin:0">${[['day','اليوم'],['week','الأسبوع'],['month','الشهر'],['year','السنة']].map(([v,l])=>`<option value="${v}"${per===v?' selected':''}>${l}</option>`).join('')}</select></div>
<div class="card"><h3>المهام</h3>إجمالي ${tk.length} · مكتملة ${dn} · فائتة ${ms} · مؤجلة ${ps}${bar(tk.length?Math.round(dn/tk.length*100):0)}<div class="t2">نسبة الإنجاز ${tk.length?Math.round(dn/tk.length*100):0}%</div></div>
<div class="card"><h3>الصلوات</h3>مسجلة ${on+qa} · في وقتها ${on} · قضاءً ${qa}${bar(Math.min(100,Math.round((on+qa)/(5*days)*100)))}</div>
<div class="card"><h3>العادات</h3>نشطة ${S.habits.length} · معدل الالتزام ${hr}%${bar(hr)}<div class="t2">الأكثر انتظامًا: ${S.habits.length?E(S.habits.slice().sort((a,b)=>b.days.filter(f).length-a.days.filter(f).length)[0].n):'—'}</div></div>
<div class="card"><h3>الأهداف</h3>مكتملة ${gd} · قيد التنفيذ ${S.goals.length-gd} · متوسط التقدم ${avg}%</div>
<div class="card"><h3>خريطة النشاط (12 أسبوعًا)</h3><div class="hm">${cells.join('')}</div></div>`},
settings(){return `<h2>الإعدادات</h2><div class="card"><label>الاسم<input id="sn" value="${E(S.name)}"></label><div class="row"><button data-a="theme">تبديل المظهر (داكن/فاتح)</button></div></div>
<div class="card"><h3>النسخ الاحتياطي</h3><div class="t2">انسخ النص التالي واحفظه في مكان آمن، ثم الصقه هنا لاحقًا للاستعادة.</div><textarea id="ex" rows="4" readonly>${E(JSON.stringify(S))}</textarea><textarea id="im" rows="3" placeholder="الصق النسخة الاحتياطية هنا"></textarea><button class="b" data-a="imp">استعادة</button></div>
<div class="card"><div class="t2">التذكيرات وإشعارات المتصفح وقاعدة Supabase تحتاج إعدادًا خارجيًا ومفاتيح، وغير مفعّلة. بياناتك محفوظة على هذا المتصفح فقط.</div></div>`}};
const JC=['مذكراتي اليومية','خواطري','أفكاري','أحلامي وأهدافي','أشياء أشعر بالامتنان لها','ملاحظات خاصة'];
function jl(){const q=jq.toLowerCase(),l=NOTES.filter(n=>(!jc||n.cat===jc)&&(!q||(n.t+n.c+(n.kw||'')).toLowerCase().includes(q))).sort((a,b)=>b.ts-a.ts);
return l.length?l.map(n=>`<div class="card"><div class="row sp"><b>${E(n.t)}</b><span class="t2">${new Date(n.ts).toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'})}</span></div><div class="t2">${E(n.cat)}${n.mood?' · '+E(n.mood):''}${n.kw?' · '+E(n.kw):''}</div><p style="white-space:pre-wrap">${E(n.c)}</p><div class="row"><button data-a="je" data-i="${n.id}">تعديل</button><button class="dn" data-a="jx" data-i="${n.id}">حذف</button></div></div>`).join(''):'<div class="empty">هذه مساحتك الخاصة، اكتب ما يجول بخاطرك.</div>'}
const nf=n=>[{k:'t',l:'العنوان',v:n.t,r:1},{k:'c',l:'المذكرة',t:'area',v:n.c},{k:'cat',l:'التصنيف',t:'sel',o:JC.map(c=>[c,c]),v:n.cat},{k:'mood',l:'الحالة المزاجية (اختياري)',v:n.mood},{k:'kw',l:'كلمات مفتاحية',v:n.kw}];
/* ===== actions ===== */
const find=(a,i)=>a.find(x=>x.id===i);
const A={
go:v=>{view=v;R()},theme(){S.theme=S.theme==='dark'?'light':'dark';save();R()},per(i,e){per=e.value;R()},pdate(i,e){if(e.value){pd=e.value;R()}},
ta(){ask('مهمة جديدة',tf({}),o=>{S.tasks.push({id:id(),t:o.t,ds:o.ds,d:o.d,tm:o.tm,pr:o.pr,c:o.c,rp:o.rp,st:'new'});save();R()})},
te(i){const x=find(S.tasks,i);ask('تعديل المهمة',tf(x),o=>{Object.assign(x,{t:o.t,ds:o.ds,d:o.d,tm:o.tm,pr:o.pr,c:o.c,rp:o.rp});save();R()})},
td(i){const x=find(S.tasks,i);if(x.st==='done'){x.st='new';x.da=''}else{x.st='done';x.da=today();if(x.rp)S.tasks.push({...x,id:id(),st:'new',da:'',d:addD(x.d,x.rp==='d'?1:7)});const tk=S.tasks.filter(y=>y.d===today());toast(tk.length&&tk.every(y=>y.st==='done')?pick('all'):pick('done'))}save();R()},
ts(i,e){find(S.tasks,i).st=e.value;save();R()},tp(i){const x=find(S.tasks,i);x.d=addD(today(),1);x.st='post';save();R()},
tx(i){if(confirm('حذف هذه المهمة؟')){S.tasks=S.tasks.filter(x=>x.id!==i);save();R()}},
pr(i){const[k,v]=i.split('|');S.prayers[pd]=S.prayers[pd]||{};if(v){S.prayers[pd][k]=v;toast(pick('pray'))}else delete S.prayers[pd][k];save();R()},
ha(){ask('عادة جديدة',[{k:'n',l:'اسم العادة',r:1},{k:'ds',l:'وصف'},{k:'goal',l:'الهدف الأسبوعي (عدد الأيام)',t:'number'},{k:'st',l:'تاريخ البداية',t:'date',v:today()}],o=>{S.habits.push({id:id(),n:o.n,ds:o.ds,goal:o.goal,st:o.st,days:[]});save();R()})},
hd(i){const h=find(S.habits,i),t=today();if(h.days.includes(t))h.days=h.days.filter(d=>d!==t);else{h.days.push(t);toast(streak(h)>=3?pick('habit'):pick('done'))}save();R()},
hx(i){if(confirm('حذف هذه العادة وسجلها؟')){S.habits=S.habits.filter(x=>x.id!==i);save();R()}},
ga(){ask('هدف جديد',[{k:'t',l:'عنوان الهدف',r:1},{k:'k',l:'النوع',t:'sel',o:['أسبوعي','شهري','سنوي','مفتوح المدة'].map(x=>[x,x])},{k:'due',l:'الموعد المستهدف',t:'date'}],o=>{S.goals.push({id:id(),t:o.t,k:o.k,due:o.due,steps:[]});save();R()})},
gst(i){ask('خطوة جديدة',[{k:'x',l:'الخطوة',r:1}],o=>{find(S.goals,i).steps.push({x:o.x,done:false});save();R()})},
gs(i){const[g,n]=i.split('|'),s=find(S.goals,g).steps[n];s.done=!s.done;save();R()},
gx(i){if(confirm('حذف هذا الهدف؟')){S.goals=S.goals.filter(x=>x.id!==i);save();R()}},
rfin(){toast('انتهى يوم آخر، الحمد لله على ما كان، وغدًا فرصة جديدة.')},
imp(){try{const o=JSON.parse($('#im').value);if(!Array.isArray(o.tasks))throw 0;S=o;save();KEY=null;toast('تمت الاستعادة');R()}catch(e){toast('النسخة غير صالحة')}},
jset(){ask('رمز القفل',[{k:'p',l:'الرمز السري (6 أحرف على الأقل)',t:'password',r:1}],async o=>{if(o.p.length<6)return toast('الرمز قصير');const salt=crypto.getRandomValues(new Uint8Array(16));KEY=await derive(o.p,salt);NOTES=[];S.vault={salt:b2s(salt)};await seal();R()})},
junl(){ask('فتح المذكرات',[{k:'p',l:'الرمز السري',t:'password',r:1}],async o=>{try{const k=await derive(o.p,s2b(S.vault.salt));NOTES=JSON.parse(td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:s2b(S.vault.iv)},k,s2b(S.vault.d))));KEY=k;R()}catch(e){toast('الرمز غير صحيح')}},'فتح')},
jlock(){KEY=null;NOTES=[];R()},
jpw(){ask('رمز جديد',[{k:'p',l:'الرمز الجديد',t:'password',r:1}],async o=>{if(o.p.length<6)return toast('الرمز قصير');const salt=crypto.getRandomValues(new Uint8Array(16));KEY=await derive(o.p,salt);S.vault.salt=b2s(salt);await seal();toast('تم تغيير الرمز')})},
ja(){ask('مذكرة جديدة',nf({}),async o=>{NOTES.push({id:id(),ts:Date.now(),...o});await seal();R()})},
je(i){const n=find(NOTES,i);ask('تعديل المذكرة',nf(n),async o=>{Object.assign(n,o);await seal();R()})},
async jx(i){if(confirm('حذف هذه المذكرة نهائيًا؟')){NOTES=NOTES.filter(x=>x.id!==i);await seal();R()}}};
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)return A.go(g.dataset.go);const b=e.target.closest('[data-a]');if(b&&b.tagName!=='SELECT'&&!(b.tagName==='INPUT'&&b.type==='date'))A[b.dataset.a]?.(b.dataset.i,b)});
document.addEventListener('change',e=>{const b=e.target.closest('select[data-a],input[data-a]');if(b)A[b.dataset.a]?.(b.dataset.i,b);if(e.target.id==='jc'){jc=e.target.value;$('#jl').innerHTML=jl()}if(e.target.id==='sn'){S.name=e.target.value.trim();save();nav()}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.rk){const d=today();S.reviews[d]=S.reviews[d]||{};S.reviews[d][t.dataset.rk]=t.value;save()}if(t.id==='jq'){jq=t.value;$('#jl').innerHTML=jl()}});
function nav(){$('#nav').innerHTML='<h1>رفيق</h1>'+NAV.map(([k,i,l])=>`<a class="${view===k?'on':''}" data-go="${k}" title="${l}">${i}<span>${l}</span></a>`).join('')}
function R(){document.documentElement.dataset.t=S.theme;nav();const m=$('#m');m.style.animation='none';m.offsetHeight;m.style.animation='';m.innerHTML=V[view]();window.scrollTo(0,0)}
R();
if(!S.name)ask('مرحبًا بك في رفيق',[{k:'n',l:'ما اسمك؟',r:1}],o=>{S.name=o.n;save();R()},'ابدأ');