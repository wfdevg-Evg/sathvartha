
const SRC=['Tele call','Surveys','D2D','Card Service','Home Mission Invite','Personal Reference','Hospital Service','School Service','Apartment Service','Bible Quiz','Music Ministry','Camps'];
const ST1=['Positive','Neutral','Negative','Busy','Not Connected'];
const ST2=ST1.concat(['Different Approach Shared','Holy Mother/Rosary Topics','Signs Of Times','Coming of Prophets']);
const LANG=['English','Malayalam','Kannada','Tamil','Telugu','Hindi','Konkani','Oriya'];
const TYPE=['Call','Visit','Call + Visit'];
const STG=['Ready For Sathvartha','Attended Sathvartha','In Fellowship'];
const FELS=['','Whitefield','Marathahalli','HAL'],NSEC=18;
const SCH={
fresh:{t:'Fresh Contacts',f:[['Contact_ID','id'],['Type','s',TYPE],['Date','date'],['Name','text'],['Mobile','tel'],['Reference','s',SRC],['Referred_By','text'],['Fellowship','s',FELS],['Evg','ev'],['Status','s',ST1]]},
follow:{t:'Follow Ups',f:[['Contact_ID','cid'],['Type','s',TYPE],['Date','date'],['Name','text'],['Mobile','tel'],['Fellowship','s',FELS],['Evg','ev'],['Status','s',ST2]]},
content:{t:'Content Share',f:[['Contact_ID','cid'],['Type','s',TYPE],['Date','date'],['Mobile','tel'],['Reference','s',SRC],['Fellowship','s',FELS],['Evg','ev'],['Status','s',ST2],['Topics','mc'],['Library_Items','lib']]},
lib:{t:'Content Library',f:[['Content_ID','lid'],['Section','s',Array.from({length:NSEC},(_,i)=>String(i+1))],['Title','text'],['Kind','s',['Text','Link','File']],['Content','ta'],['Language','s',['',...LANG]],['Updated','date']]},
home:{t:'Home Missions',f:[['Date','date'],['Language','s',LANG],['Name','text'],['Mobile','tel'],['Name_Presenter','ev'],['Fellowship_Area','s',FELS],['Contact_ID','id']]},
sath:{t:'Sathvartha Journey',f:[['Contact_ID','cid'],['Stage','s',STG],['Date','date'],['Name','text'],['Mobile','tel'],['Fellowship','s',FELS],['Evg','ev']]},
travel:{t:'Travel Details',f:[['Sl_No','sl'],['Fellowship_Area_Name','s',FELS],['Name','text'],['Age','number'],['Gender','s',['','Male','Female','Other']],['Address','text'],['Phone_No','tel'],['Reference_Name','text'],['First_Coming_Evangelist','ev'],['Second_Coming_Evangelist','ev'],['Denomination','text'],['Religion','text'],['Onward_Train_Details','text'],['Arrival_Date_Time','dt'],['Return_Train_Details','text'],['Departure_Date_Time','dt'],['Language','s',['',...LANG]],['Contact_ID','cid']]}
};
let MANAGER=false; // chosen at runtime: team by default, manager after PIN login (Sync tab)
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const KEYS=Object.keys(SCH);let db={fresh:[],follow:[],content:[],lib:[],home:[],sath:[],travel:[],evs:[],evm:{}},tab=MANAGER?'dash':'my',q='',fel='',evf='',per='month',cur='',ed=null,cfg={},flash='',impTab='';
try{const s=localStorage.getItem('zs_v1');if(s)db=Object.assign(db,JSON.parse(s))}catch(e){}
db.sath=db.sath.map(r=>r.Attended_Date?{Contact_ID:r.Contact_ID,Stage:'Attended Sathvartha',Date:r.Attended_Date,Name:'',Mobile:'',Fellowship:r.Fellowship,Evg:r.Evg}:r);
db.fresh.concat(db.content).forEach(r=>{if(r.Reference=='Hospital Evg Service')r.Reference='Hospital Service'});db.evs=db.evs||[];KEYS.forEach(k=>db[k].forEach(r=>{if(!r._id)r._id=uid()}));
const $=s=>document.querySelector(s),dlg=$('#dlg'),HP=$('header p'),HP0=HP.textContent;
let tm;const persist=()=>{KEYS.forEach(k=>db[k].forEach(r=>{if(!r._id)r._id=uid()}));try{localStorage.setItem('zs_v1',JSON.stringify(db))}catch(e){}clearTimeout(tm);tm=setTimeout(flush,900)};
try{cfg=JSON.parse(localStorage.getItem('zs_cfg'))||{}}catch(e){}
MANAGER=cfg.role==='manager';tab=MANAGER?'dash':'my';
const saveCfg=()=>{try{localStorage.setItem('zs_cfg',JSON.stringify(cfg))}catch(e){}};
if(!MANAGER&&cfg.me)evf=cfg.me;
const DEF_EV=['Sajan Bernard','John Martis','Veera','Laura','Beula','Ruth','Anitha','Susanna Elisha','Susanna Emmanuel G','Surya Abraham','Elisha','Yesu Maya','Yesu Mevina','David Pradhan','Sara Manjula','Shilpa Emmanuel','Chaitra','Shalini','Sunil Lasrado','Navin Lobo','Tessy David'];
if(!db.evsSeeded){DEF_EV.forEach(n=>{if(!db.evs.includes(n))db.evs.push(n)});db.evsSeeded=1;sortEv()}
const iso=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.toISOString().slice(0,10)};
const days=d=>d?Math.floor((Date.now()-new Date(d))/864e5):null;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fOf=r=>r.Fellowship||r.Fellowship_Area||r.Fellowship_Area_Name||'';
function nextId(){let n=0;KEYS.forEach(k=>db[k].forEach(r=>{const m=/^ZS-(\d+)$/.exec(r.Contact_ID||'');if(m)n=Math.max(n,+m[1])}));return'ZS-'+String(n+1).padStart(4,'0')}
function level(d){return d==null?'—':d>=30?'Pending':d>=14?'Overdue':d>=7?'Due':'On track'}
function contacts(){const m={};KEYS.forEach(k=>db[k].forEach(r=>{const id=r.Contact_ID;if(!id)return;const c=m[id]||(m[id]={Contact_ID:id,Name:'',Mobile:'',Fellowship:'',Evg:'',Last_Activity:''});
['Name','Mobile','Evg'].forEach(x=>{if(r[x]&&!c[x])c[x]=r[x]});if(fOf(r)&&!c.Fellowship)c.Fellowship=fOf(r);
const d=r.Date||r.Attended_Date;if(d&&d>c.Last_Activity)c.Last_Activity=d}));
return Object.values(m).map(c=>{c.Days_Since=days(c.Last_Activity);c.Level=level(c.Days_Since);return c}).sort((a,b)=>(b.Days_Since??-1)-(a.Days_Since??-1))}
function inPer(d){if(!d)return false;const n=days(d);if(n<0)return per=='all';return per=='day'?n==0:per=='week'?n<7:per=='month'?d.slice(0,7)==iso(0).slice(0,7):true}
function add3(d){if(!d)return'9999';const x=new Date(d);x.setMonth(x.getMonth()+3);return x.toISOString().slice(0,10)}
const evOf=r=>r.Evg||r.Name_Presenter||r.First_Coming_Evangelist||'';
const fl=a=>a.filter(r=>(!fel||fOf(r)==fel)&&(!evf||evOf(r)==evf));
const met=r=>!['Busy','Not Connected'].includes(r.Status);
function nav(){$('#nav').innerHTML=[['my','My Day'],['dash','Dashboard'],['rep','Reports'],...KEYS.map(k=>[k,SCH[k].t]),['ticks','Sathvartha ✓'],['evs','Evangelists'],['rem','Reminders'],['sync','Sync'+(cfg.api?' ●':'')]].filter(x=>MANAGER?x[0]!='my':(x[0]!='dash'&&x[0]!='rep')).map(([k,l])=>`<button class="${tab==k?'on':''}" onclick="tab='${k}';q='';render()">${l}</button>`).join('')}
function fels(){return FELS.slice(1)}
function filt(){return`<select onchange="fel=this.value;render()"><option value="">All fellowships</option>${fels().map(f=>`<option ${f==fel?'selected':''}>${esc(f)}</option>`).join('')}</select><select onchange="evf=this.value;render()"><option value="">All evangelists</option>${db.evs.map(f=>`<option ${f==evf?'selected':''}>${esc(f)}</option>`).join('')}</select>`}
const stg=n=>fl(db.sath).filter(r=>r.Stage==n);
function done3(){const m={};fl(db.sath).forEach(r=>{if(!r.Date)return;const k=r.Stage=='In Fellowship'?'f':r.Stage=='Attended Sathvartha'?'a':'';if(!k)return;const c=m[r.Contact_ID]||(m[r.Contact_ID]={});if(!c[k]||r.Date<c[k])c[k]=r.Date});return Object.values(m).map(c=>add3(c.f||c.a)).filter(e=>e<=iso(0))}
function dash(){
const P=[['day','Today'],['week','7 days'],['month','This month'],['all','All time']];
const K=[['New Appointments Met',fl(db.fresh).filter(r=>inPer(r.Date)&&met(r)).length],
['Follow-up Appointments Met',fl(db.follow).filter(r=>inPer(r.Date)&&met(r)).length],
['Home Missions Conducted',new Set(fl(db.home).filter(r=>inPer(r.Date)).map(r=>[r.Date,r.Name_Presenter,r.Fellowship_Area].join('|'))).size],
['Ready For Sathvartha',stg('Ready For Sathvartha').filter(r=>inPer(r.Date)).length],
['Attended Sathvartha',stg('Attended Sathvartha').filter(r=>inPer(r.Date)).length],
['In Fellowship',stg('In Fellowship').filter(r=>inPer(r.Date)).length],
['Completed 3 Months in Fellowship',done3().filter(inPer).length]];
const rk={'Ready For Sathvartha':0,'Attended Sathvartha':1,'In Fellowship':2},top={};fl(db.sath).forEach(r=>{top[r.Contact_ID]=Math.max(top[r.Contact_ID]??-1,rk[r.Stage]??-1)});const jr=[0,0,0];Object.values(top).forEach(v=>v>=0&&jr[v]++);const jm=Math.max(1,...jr);
const cs=contacts().filter(c=>(!fel||c.Fellowship==fel)&&(!evf||c.Evg==evf)),lv={};cs.forEach(c=>lv[c.Level]=(lv[c.Level]||0)+1);
const st={};fl(db.fresh).forEach(r=>st[r.Status]=(st[r.Status]||0)+1);const mx=Math.max(1,...Object.values(st));
const src={};fl(db.fresh).forEach(r=>src[r.Reference]=(src[r.Reference]||0)+1);const ms=Math.max(1,...Object.values(src));
return liveLine()+`<div class="row"><select onchange="per=this.value;render()">${P.map(([v,l])=>`<option value="${v}" ${v==per?'selected':''}>${l}</option>`).join('')}</select>${filt()}</div>
<div class="grid">${K.map(([l,v])=>`<div class="card kpi"><span>${l}</span><b>${v}</b></div>`).join('')}</div>${regTable('By fellowship · '+({day:'today',week:'last 7 days',month:'this month',all:'all time'}[per])+' · all three fellowships together in the last row',d=>inPer(d))}${evTable()}${trend14()}
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
<div class="card"><h2>Fresh contact status</h2>${Object.entries(st).map(([k,v])=>`<div class="bar"><em>${esc(k)}</em><i style="width:${v/mx*100}%"></i>${v}</div>`).join('')||'<div class="empty">No data</div>'}</div>
<div class="card"><h2>Contact source</h2>${Object.entries(src).map(([k,v])=>`<div class="bar"><em>${esc(k)}</em><i style="width:${v/ms*100}%"></i>${v}</div>`).join('')||'<div class="empty">No data</div>'}</div>
<div class="card"><h2>Sathvartha journey (current stage)</h2>${STG.map((k,i)=>`<div class="bar"><em>${k}</em><i style="width:${jr[i]/jm*100}%"></i>${jr[i]}</div>`).join('')}</div>
<div class="card"><h2>Follow-up health</h2>${['Due','Overdue','Pending','On track'].map(k=>`<div class="bar"><em>${k}</em><span class="pill ${k=='On track'?'ok':k}">${lv[k]||0}</span></div>`).join('')}<div style="color:var(--mu);font-size:12px">Due 7+ · Overdue 14+ · Pending 30+ days</div></div></div>
<div class="row" style="justify-content:center;margin-top:16px"><button class="btn g s" id="clr" onclick="clr()">Clear all data</button></div>`}
function table(cols,rows,del){return rows.length?`<div class="tw"><table><tr>${cols.map(c=>`<th>${c.replace(/_/g,' ')}</th>`).join('')}${del?'<th></th>':''}</tr>${rows.map(r=>`<tr>${cols.map(c=>{const v=r[c]??'';return`<td>${c=='Library_Items'?esc(libT(v)):c=='Content'?esc(String(v).slice(0,70)):c=='Checked'?(v=='Yes'?'<span class="pill ok">✓ Checked</span>':'<span class="pill Due">To check</span>'):c=='Status'||c=='Level'||c=='Stage'?`<span class="pill ${String(v).replace(' ','')=='Ontrack'?'ok':v}">${esc(v)}</span>`:esc(v)}</td>`}).join('')}${del?`<td>${tab=='travel'?tl(r):tab=='content'?cl(r):''}<button class="btn g s" onclick="openF('${tab}',${r._i})">Edit</button> <button class="btn g s" onclick="del_('${tab}',${r._i})">✕</button></td>`:''}</tr>`).join('')}</table></div>`:'<div class="card empty">No records yet — tap “+ Add”.</div>'}
function list(){const S=SCH[tab],cols=S.f.map(f=>f[0]).concat(tab=='travel'?['Checked']:[]);
const rows=db[tab].map((r,i)=>({...r,_i:i})).filter(r=>(tab=='lib'||(!fel||fOf(r)==fel)&&(!evf||evOf(r)==evf))&&(!q||JSON.stringify(r).toLowerCase().includes(q))).sort((a,b)=>(b.Date||b.Attended_Date||'').localeCompare(a.Date||a.Attended_Date||''));
return`<div class="row"><input placeholder="Search…" value="${esc(q)}" oninput="q=this.value.toLowerCase();render(1)" style="flex:1;min-width:140px">${filt()}<button class="btn g" onclick="csv('${tab}')">Export CSV</button><button class="btn g" onclick="impTab='${tab}';$('#imp').click()">Import CSV</button><button class="btn g" onclick="csv('${tab}',1)">Template</button><button class="btn" onclick="openF('${tab}')">+ Add</button></div>${tab=='travel'?tbar():''}${table(cols,rows,1)}`}
function rem(){const cs=contacts().filter(c=>(!fel||c.Fellowship==fel)&&(!evf||c.Evg==evf)&&c.Level!='On track'&&c.Level!='—');
const rows=cs.map(c=>c);
const t=`<div class="row">${filt()}<button class="btn g" onclick="csv('rem')">Export CSV</button></div>${nudges(rows)}`+(rows.length?`<div class="tw"><table><tr>${['Contact ID','Name','Mobile','Fellowship','Evg','Last Activity','Days Since','Level'].map(h=>`<th>${h}</th>`).join('')}<th></th></tr>${rows.map(c=>`<tr><td>${c.Contact_ID}</td><td>${esc(c.Name)}</td><td>${esc(c.Mobile)}</td><td>${esc(c.Fellowship)}</td><td>${esc(c.Evg)}</td><td>${c.Last_Activity}</td><td>${c.Days_Since}</td><td><span class="pill ${c.Level}">${c.Level}</span></td><td>${c.Mobile?`<a class="btn g s" style="text-decoration:none" target="_blank" href="https://wa.me/${c.Mobile.replace(/\D/g,'')}?text=${encodeURIComponent('Hello '+c.Name+', we would love to connect with you again.')}">WhatsApp</a>`:''} ${evN(c)}</td></tr>`).join('')}</table></div>`:'<div class="card empty">🎉 Everyone is up to date.</div>');return t}
let gran='month';
function buckets(){const t=new Date(iso(0)+'T00:00:00Z'),B=[],D=d=>d.toISOString().slice(0,10);
for(let i=5;i>=0;i--){let s,e,l;
if(gran=='week'){s=new Date(t);s.setUTCDate(t.getUTCDate()-((t.getUTCDay()+6)%7)-7*i);e=new Date(s);e.setUTCDate(s.getUTCDate()+6);l='Wk '+s.toUTCString().slice(5,11)}
else{const n=gran=='month'?1:3,mo=gran=='month'?t.getUTCMonth():Math.floor(t.getUTCMonth()/3)*3;s=new Date(Date.UTC(t.getUTCFullYear(),mo-n*i,1));e=new Date(Date.UTC(s.getUTCFullYear(),s.getUTCMonth()+n,0));l=gran=='month'?s.toUTCString().slice(8,16):'Q'+(Math.floor(s.getUTCMonth()/3)+1)+' '+s.getUTCFullYear()}
B.push({s:D(s),e:D(e),l,cur:i==0})}return B}
function repData(){const B=buckets(),I=(d,b)=>!!d&&d>=b.s&&d<=b.e,td=iso(0);
const M=[['Total Fresh Contacts',b=>fl(db.fresh).filter(r=>I(r.Date,b)).length],
['Total Follow-up Appointments',b=>fl(db.follow).filter(r=>I(r.Date,b)).length],
['Home Missions Conducted',b=>new Set(fl(db.home).filter(r=>I(r.Date,b)).map(r=>[r.Date,r.Name_Presenter,r.Fellowship_Area].join('|'))).size],
['Ready For Sathvartha',b=>stg('Ready For Sathvartha').filter(r=>I(r.Date,b)).length],
['Attended Sathvartha',b=>stg('Attended Sathvartha').filter(r=>I(r.Date,b)).length],
['In Fellowship',b=>stg('In Fellowship').filter(r=>I(r.Date,b)).length],
['Completed 3 Months in Fellowship',b=>done3().filter(e=>I(e,b)).length]];
return{B,rows:M.map(([n,f])=>[n,...B.map(f)])}}
function rep(){return rep0()+regBlock()}
function rep0(){const {B,rows}=repData();
return`<div class="row"><select onchange="gran=this.value;render()">${[['week','Weekly'],['month','Monthly'],['quarter','Quarterly']].map(([v,l])=>`<option value="${v}" ${v==gran?'selected':''}>${l}</option>`).join('')}</select>${filt()}<button class="btn g" onclick="csv('rep')">Export CSV</button></div>
<div class="tw"><table><tr><th>Metric</th>${B.map(b=>`<th ${b.cur?'style="color:var(--pr)"':''}>${b.l}${b.cur?' ●':''}</th>`).join('')}<th>Total</th></tr>${rows.map(r=>`<tr><td><b>${r[0]}</b></td>${r.slice(1).map((v,i)=>`<td ${B[i].cur?'style="background:var(--pr2)"':''}>${v}</td>`).join('')}<td><b>${r.slice(1).reduce((a,b)=>a+b,0)}</b></td></tr>`).join('')}</table></div>
<div style="color:var(--mu);font-size:12px;margin-top:8px">● current period · last 6 periods · stages come from the Sathvartha Journey tab · Completed 3 Months counts 3 months after joining Fellowship (attendance date if Fellowship not yet logged)</div>`}
function parseCSV(t){const R=[];let r=[],c='',q=0;for(let i=0;i<t.length;i++){const h=t[i];if(q){if(h=='"'){if(t[i+1]=='"'){c+='"';i++}else q=0}else c+=h}else if(h=='"')q=1;else if(h==','){r.push(c);c=''}else if(h=='\n'||h=='\r'){if(h=='\r'&&t[i+1]=='\n')i++;r.push(c);c='';R.push(r);r=[]}else c+=h}if(c||r.length){r.push(c);R.push(r)}return R.filter(x=>x.some(y=>y.trim()))}
const wa=m=>{let n=String(m||'').replace(/\D/g,'');if(n.length==10)n='91'+n;return n};
function liveLine(){return`<div class="row" style="justify-content:space-between"><span style="font-size:12px;color:var(--mu)">${cfg.api?`<b style="color:var(--ok)">● Live</b> · ${esc(syncMsg)||'connecting…'} · auto-refresh every 30 s`:'Local data only — connect Google Sheets in the Sync tab for team-wide live data'}</span>${cfg.api?'<button class="btn g s" onclick="pullNow()">Refresh now</button>':''}</div>`}
function evTable(){
const fr=a=>a.filter(r=>!fel||fOf(r)==fel),cs=contacts().filter(c=>!fel||c.Fellowship==fel);
const names=[...new Set(db.evs.concat(...[db.fresh,db.follow,db.content].map(a=>a.map(evOf))).filter(Boolean))];
const rows=names.map(n=>{const L=l=>cs.filter(c=>c.Evg==n&&c.Level==l).length;return{n,a:fr(db.fresh).filter(r=>evOf(r)==n&&inPer(r.Date)&&met(r)).length,b:fr(db.follow).filter(r=>evOf(r)==n&&inPer(r.Date)&&met(r)).length,c:fr(db.content).filter(r=>evOf(r)==n&&inPer(r.Date)).length,d:L('Due'),o:L('Overdue'),p:L('Pending')}}).filter(r=>r.a+r.b+r.c+r.d+r.o+r.p>0).sort((x,y)=>(y.p*3+y.o*2+y.d)-(x.p*3+x.o*2+x.d)||(y.a+y.b)-(x.a+x.b));
const pill=(v,k)=>v?`<span class="pill ${k}">${v}</span>`:'<span style="color:var(--mu)">0</span>';
return`<div class="card" style="padding:0;margin-bottom:14px"><h2 style="padding:14px 14px 0">By evangelist <span style="font-weight:400;color:var(--mu);font-size:12px">· activity in the selected period · follow-up status as of now</span></h2><div class="tw" style="border:0"><table style="min-width:520px"><tr><th>Evangelist</th><th>New</th><th>Follow-ups</th><th>Shares</th><th>Due</th><th>Overdue</th><th>Pending</th></tr>${rows.map(r=>`<tr><td>${esc(r.n)}</td><td>${r.a}</td><td>${r.b}</td><td>${r.c}</td><td>${pill(r.d,'Due')}</td><td>${pill(r.o,'Overdue')}</td><td>${pill(r.p,'Pending')}</td></tr>`).join('')||'<tr><td colspan="7" class="empty">No activity</td></tr>'}</table></div></div>`}
function trend14(){
const D=[];for(let i=13;i>=0;i--)D.push(iso(-i));
const n=D.map(d=>fl(db.fresh).filter(r=>r.Date==d).length+fl(db.follow).filter(r=>r.Date==d).length),m=Math.max(1,...n);
return`<div class="card" style="margin-bottom:14px"><h2>Last 14 days · contacts + follow-ups</h2><div class="trend">${D.map((d,i)=>`<div title="${d}: ${n[i]}"><span>${n[i]||''}</span><i style="height:${n[i]/m*80}%"></i><em style="font-style:normal">${d.slice(8)}</em></div>`).join('')}</div></div>`}
function myDay(){
if(!cfg.me)return`<div class="card"><h2>Who are you?</h2><p style="color:var(--mu);font-size:12px;margin:0 0 8px">Pick your name once. Your follow-ups, reminders and new entries will be set to you.</p>${db.evs.length?`<select id="me_s" style="width:100%"><option value=""></option>${db.evs.map(n=>`<option>${esc(n)}</option>`).join('')}</select><div class="row" style="margin:14px 0 0"><button class="btn" onclick="setMe()">Continue</button></div>`:'<div class="empty">No evangelists in the list yet — open the Evangelists tab to add or upload them.</div>'}</div>`;
const me=cfg.me,td=iso(0),mo=td.slice(0,7),mine=a=>a.filter(r=>evOf(r)==me),F=mine(db.fresh),U=mine(db.follow),S=mine(db.content);
const inM=r=>(r.Date||'').slice(0,7)==mo&&r.Date<=td;
const cs=contacts().filter(c=>c.Evg==me&&c.Level!='On track'&&c.Level!='—'),L=l=>cs.filter(c=>c.Level==l).length;
const rk={'Ready For Sathvartha':0,'Attended Sathvartha':1,'In Fellowship':2},top={};mine(db.sath).forEach(r=>{top[r.Contact_ID]=Math.max(top[r.Contact_ID]??-1,rk[r.Stage]??-1)});const jr=[0,0,0];Object.values(top).forEach(v=>v>=0&&jr[v]++);
const K=[['Entries today',F.concat(U,S).filter(r=>r.Date==td).length,''],['New appointments (month)',F.filter(r=>inM(r)&&met(r)).length,''],['Follow-ups (month)',U.filter(r=>inM(r)&&met(r)).length,''],['Due · 7+ days',L('Due'),'wa'],['Overdue · 14+ days',L('Overdue'),'er'],['Pending · 30+ days',L('Pending'),'er']];
return`<div class="card" style="margin-bottom:14px"><div class="row" style="margin:0;justify-content:space-between"><div><h2 style="margin:0">Hello, ${esc(me)} 👋</h2><div style="color:var(--mu);font-size:12px">${cfg.api?esc(syncMsg)||'Connected':'Not connected to the sheet'}</div></div><button class="btn g s" onclick="changeMe()">Not you?</button></div>
<div class="row" style="margin:12px 0 0"><button class="btn" onclick="openF('fresh')">+ Fresh Contact</button><button class="btn g" onclick="openF('follow')">+ Follow Up</button><button class="btn g" onclick="openF('content')">+ Content Share</button><button class="btn g" onclick="openF('home')">+ Home Mission</button></div></div>
<div class="grid">${K.map(([l,v,k])=>`<div class="card kpi"><span>${l}</span><b ${k?`style="color:var(--${k})"`:''}>${v}</b></div>`).join('')}</div>
<div class="card" style="margin-bottom:14px"><h2>My follow-ups needed (${cs.length})</h2>${cs.length?cs.map(c=>`<div class="row" style="margin:0;padding:10px 0;border-top:1px solid var(--bd);justify-content:space-between"><div><b>${esc(c.Name||c.Contact_ID)}</b> <span class="pill ${c.Level}">${c.Level}</span><div style="color:var(--mu);font-size:12px">${c.Contact_ID} · ${esc(c.Fellowship)} · last ${c.Last_Activity} (${c.Days_Since} days)</div></div><div class="row" style="margin:0">${c.Mobile?`<a class="btn g s" style="text-decoration:none" href="tel:${esc(c.Mobile)}">Call</a><a class="btn g s" style="text-decoration:none" target="_blank" href="https://wa.me/${wa(c.Mobile)}?text=${encodeURIComponent('Hello '+c.Name+',')}">WhatsApp</a>`:''}<button class="btn s" onclick="quickFollow('${c.Contact_ID}')">Follow up</button></div></div>`).join(''):'<div class="empty">🎉 Nobody is waiting for you</div>'}</div>
<div class="card"><h2>My Sathvartha journey</h2>${STG.map((k,i)=>`<div class="bar"><em>${k}</em><i style="width:${jr[i]/Math.max(1,...jr)*100}%"></i>${jr[i]}</div>`).join('')}</div>`}
function setMe(){const v=$('#me_s').value;if(!v)return;cfg.me=v;evf=v;saveCfg();render()}
function changeMe(){cfg.me='';evf='';saveCfg();render()}
function quickFollow(id){openF('follow');const e=$('#f_Contact_ID');e.value=id;fill(id)}

function evs(){return`<div class="row"><input id="evn" placeholder="Evangelist name" style="flex:1;min-width:140px"><button class="btn" onclick="addEv()">+ Add</button><button class="btn g" onclick="impTab='evs';$('#imp').click()">Upload list</button><button class="btn g" onclick="pullEv()">Pull from records</button></div>
<div class="card" style="color:var(--mu);font-size:12px;margin-bottom:12px">Upload a .csv or .txt file from your phone with one evangelist name per line (first column is used). These names become dropdown options in every Evg / Evangelist field. “Pull from records” collects names already entered.</div>
${db.evs.length?`<div class="tw"><table><tr><th>#</th><th>Name</th><th>Mobile (WhatsApp)</th><th>Email</th><th></th></tr>${db.evs.map((n,i)=>`<tr><td>${i+1}</td><td>${esc(n)}</td><td><input value="${esc(evMob(n))}" placeholder="91XXXXXXXXXX" onchange="setEvm(${i},'Mobile',this.value)" style="width:140px"></td><td><input value="${esc(((db.evm||{})[n]||{}).Email||'')}" placeholder="name@email.com" onchange="setEvm(${i},'Email',this.value)" style="width:190px"></td><td><button class="btn g s" onclick="delEv(${i})">✕</button></td></tr>`).join('')}</table></div>`:'<div class="card empty">No evangelists yet.</div>'}`}
const libT=v=>String(v||'').split(/[^A-Za-z0-9-]+/).filter(Boolean).map(id=>{const x=db.lib.find(l=>l.Content_ID==id);return x?x.Title:id}).join(', ');
function nextLib(){let n=0;db.lib.forEach(r=>{const m=/^LB-(\d+)$/.exec(r.Content_ID||'');if(m)n=Math.max(n,+m[1])});return'LB-'+String(n+1).padStart(4,'0')}
function libFilter(){const on=[...document.querySelectorAll('#f_Topics input:checked')].map(x=>x.value);document.querySelectorAll('#f_Library_Items label[data-sec]').forEach(e=>{e.style.display=!on.length||on.includes(e.dataset.sec)?'flex':'none'})}
async function upFile(inp){const f=inp.files[0];if(!f)return;const m=$('#lmsg');if(!cfg.api){m.textContent='Connect the Google Sheet first (Sync tab)';inp.value='';return}if(f.size>8e6){m.textContent='Max 8 MB';inp.value='';return}m.textContent='Uploading…';
try{const data=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(f)});const j=await api({upload:{name:f.name,mime:f.type||'application/octet-stream',data}});$('#f_Content').value=j.url;$('#f_Kind').value='File';if(!$('#f_Title').value)$('#f_Title').value=f.name;m.textContent='Uploaded ✓'}catch(e){m.textContent='Upload failed: '+e.message}}
const cl=r=>{const ids=String(r.Library_Items||'').split(/[^A-Za-z0-9-]+/).filter(Boolean),it=db.lib.filter(x=>ids.includes(x.Content_ID));if(!it.length||!r.Mobile)return'';return`<a class="btn g s" style="text-decoration:none" target="_blank" href="https://wa.me/${wa(r.Mobile)}?text=${encodeURIComponent(it.map(x=>'*'+x.Title+'*\n'+x.Content).join('\n\n'))}">Send</a> `};

/* ---- travel: manager check before sending ---- */
const tl=r=>{
if(r.Checked!='Yes')return MANAGER?`<button class="btn s" onclick="chk('${r._id}')">✓ Check</button> `:'<span style="color:var(--mu);font-size:12px">awaiting manager check</span> ';
const m=encodeURIComponent(tmsg(r));
return`<a class="btn g s" style="text-decoration:none" target="_blank" href="https://wa.me/${cfg.wa||''}?text=${m}">WhatsApp</a> <a class="btn g s" style="text-decoration:none" href="mailto:${esc(cfg.em||'')}?subject=${encodeURIComponent('Sathvartha travel – '+r.Name)}&body=${m}">Email</a> ${MANAGER?`<button class="btn g s" onclick="chk('${r._id}',1)">Uncheck</button> `:''}`};
function chk(id,un){const t=db.travel.find(x=>x._id==id);if(!t)return;
if(un){t.Checked='';t.Checked_By='';t.Checked_On=''}
else{const miss=['Age','Gender','Address','Phone_No','Onward_Train_Details','Arrival_Date_Time','Return_Train_Details','Departure_Date_Time'].filter(k=>!t[k]);if(miss.length&&!confirm('Still empty: '+miss.map(x=>x.replace(/_/g,' ')).join(', ')+'.\nMark as checked anyway?'))return;t.Checked='Yes';t.Checked_By='Manager';t.Checked_On=iso(0)}
persist();render()}

/* ---- Sathvartha tick marks ---- */
function mile(id){const R=db.sath.filter(r=>r.Contact_ID==id),d=s=>R.filter(r=>r.Stage==s&&r.Date).map(r=>r.Date).sort()[0]||'',has=s=>R.some(r=>r.Stage==s);
const start=d('In Fellowship')||d('Attended Sathvartha'),due=start?add3(start):'';return{rdy:has('Ready For Sathvartha'),att:has('Attended Sathvartha'),fel:has('In Fellowship'),start,due,done:!!start&&due<=iso(0)}}
function ticks(){
const cs=contacts().filter(c=>(!fel||c.Fellowship==fel)&&(!evf||c.Evg==evf)&&(!q||JSON.stringify(c).toLowerCase().includes(q)));
const S=['Ready For Sathvartha','Attended Sathvartha','In Fellowship'];
return`<div class="row"><input placeholder="Search…" value="${esc(q)}" oninput="q=this.value.toLowerCase();render(1)" style="flex:1;min-width:140px">${filt()}</div>
<div class="card" style="margin-bottom:12px;color:var(--mu);font-size:12px">Tick a box and enter the date. <b>Ready</b> creates the Travel Details record. <b>Attended</b> and <b>In Fellowship</b> feed the reports; “Completed 3 months” is worked out automatically from the date the person joined Fellowship (or attended Sathvartha).</div>
${cs.length?`<div class="tw"><table><tr><th>Contact</th><th>Ready</th><th>Attended</th><th>In Fellowship</th><th>3 months</th></tr>${cs.map(c=>{const m=mile(c.Contact_ID),v=[m.rdy,m.att,m.fel];return`<tr><td><b>${esc(c.Name||c.Contact_ID)}</b><br><small style="color:var(--mu)">${c.Contact_ID} · ${esc(c.Fellowship)} · ${esc(c.Evg)}</small></td>${S.map((s,i)=>`<td><input type="checkbox" style="width:22px;height:22px" ${v[i]?'checked':''} onchange="tick('${c.Contact_ID}','${s}',this.checked)"></td>`).join('')}<td>${m.done?'<span class="pill ok">✓ Completed</span>':m.start?'Due '+m.due:'—'}</td></tr>`}).join('')}</table></div>`:'<div class="card empty">No contacts yet.</div>'}`}
function tick(id,stage,on){const c=contacts().find(x=>x.Contact_ID==id);if(!c)return;
if(on){const d=(prompt(stage+' — date (YYYY-MM-DD)',iso(0))||'').trim();if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){render();return}
db.sath.push({Contact_ID:id,Stage:stage,Date:d,Name:c.Name,Mobile:c.Mobile,Fellowship:c.Fellowship,Evg:c.Evg});
if(stage=='Ready For Sathvartha'&&!db.travel.some(t=>t.Contact_ID==id)){db.travel.push(mkTravel({Contact_ID:id,Name:c.Name,Mobile:c.Mobile,Fellowship:c.Fellowship,Evg:c.Evg}));flash='Travel Details created for '+(c.Name||id)+' — complete them in the Travel Details tab.'}
else flash='Recorded — included in the reports'}
else{if(!confirm('Remove “'+stage+'” for '+(c.Name||id)+'?')){render();return}db.sath=db.sath.filter(r=>!(r.Contact_ID==id&&r.Stage==stage))}
persist();render()}

/* ---- reminders to evangelists ---- */
const evMob=n=>((db.evm||{})[n]||{}).Mobile||'';
function evN(c){const mb=evMob(c.Evg);return mb?`<a class="btn g s" style="text-decoration:none" target="_blank" href="https://wa.me/${wa(mb)}?text=${encodeURIComponent('Reminder ('+c.Level+'): please follow up '+c.Name+' ('+c.Mobile+'), '+c.Fellowship+'. Last contact '+c.Last_Activity+' — '+c.Days_Since+' days ago.')}">Remind Evg</a>`:''}
function nudges(rows){const by={};rows.forEach(c=>{if(c.Evg)(by[c.Evg]=by[c.Evg]||[]).push(c)});const L=Object.entries(by);if(!L.length)return'';
return`<div class="card" style="margin-bottom:12px"><h2>Remind evangelists</h2><div class="row" style="margin:0">${L.map(([n,a])=>{const mb=evMob(n),t='Hi '+n+', these contacts need your follow-up:\n'+a.map(c=>'• ['+c.Level+'] '+c.Name+' ('+c.Mobile+') — '+c.Days_Since+' days').join('\n');return mb?`<a class="btn g s" style="text-decoration:none" target="_blank" href="https://wa.me/${wa(mb)}?text=${encodeURIComponent(t)}">${esc(n)} (${a.length})</a>`:`<span class="pill" title="Add the mobile number in the Evangelists tab">${esc(n)} (${a.length}) · no mobile</span>`}).join('')}</div><div style="font-size:12px;color:var(--mu);margin-top:8px">The Google Sheet also e-mails every evangelist each morning (add their e-mail in the Evangelists tab).</div></div>`}
function setEvm(i,f,v){const n=db.evs[i];db.evm=db.evm||{};(db.evm[n]=db.evm[n]||{})[f]=v.trim();persist()}

const REGS=['Whitefield','Marathahalli','HAL'];
function regM(reg,inR){
const ok=r=>!reg||fOf(r)==reg,E=r=>!evf||evOf(r)==evf,A=a=>a.filter(r=>ok(r)&&E(r));
const hm=new Set(A(db.home).filter(r=>inR(r.Date)).map(r=>[r.Date,r.Name_Presenter,r.Fellowship_Area].join('|'))).size;
const st=s=>A(db.sath).filter(r=>r.Stage==s&&inR(r.Date)).length,m={};
A(db.sath).forEach(r=>{if(!r.Date)return;const k=r.Stage=='In Fellowship'?'f':r.Stage=='Attended Sathvartha'?'a':'';if(!k)return;const c=m[r.Contact_ID]||(m[r.Contact_ID]={});if(!c[k]||r.Date<c[k])c[k]=r.Date});
const c3=Object.values(m).map(c=>add3(c.f||c.a)).filter(e=>e<=iso(0)&&inR(e)).length;
const cs=contacts().filter(c=>(!reg||c.Fellowship==reg)&&E(c)),L=l=>cs.filter(c=>c.Level==l).length;
return{fc:A(db.fresh).filter(r=>inR(r.Date)&&met(r)).length,fu:A(db.follow).filter(r=>inR(r.Date)&&met(r)).length,hm,rd:st('Ready For Sathvartha'),at:st('Attended Sathvartha'),fe:st('In Fellowship'),c3,d:L('Due'),o:L('Overdue'),p:L('Pending')}}
function regTable(title,inR){
const rows=REGS.map(r=>[r,regM(r,inR)]).concat([['All fellowships',regM('',inR)]]),pl=(v,k)=>v?`<span class="pill ${k}">${v}</span>`:'<span style="color:var(--mu)">0</span>';
return`<div class="card" style="padding:0;margin-bottom:14px"><h2 style="padding:14px 14px 0">${title}</h2><div class="tw" style="border:0"><table style="min-width:680px"><tr><th>Fellowship</th><th>New</th><th>Follow-ups</th><th>Home Missions</th><th>Ready</th><th>Attended</th><th>In Fellowship</th><th>3 months</th><th>Due</th><th>Overdue</th><th>Pending</th></tr>${rows.map(([n,m],i)=>`<tr ${i==3?'style="font-weight:700;background:var(--pr2)"':''}><td>${n}</td><td>${m.fc}</td><td>${m.fu}</td><td>${m.hm}</td><td>${m.rd}</td><td>${m.at}</td><td>${m.fe}</td><td>${m.c3}</td><td>${pl(m.d,'Due')}</td><td>${pl(m.o,'Overdue')}</td><td>${pl(m.p,'Pending')}</td></tr>`).join('')}</table></div></div>`}
function regBlock(){const B=buckets(),b=B[B.length-1];return regTable('By fellowship · '+b.l+' (current period) · all three fellowships together in the last row',d=>!!d&&d>=b.s&&d<=b.e)}

function sortEv(){db.evs.sort((a,b)=>a.localeCompare(b));persist()}
function addEv(){const v=$('#evn').value.trim();if(v&&!db.evs.includes(v)){db.evs.push(v);sortEv()}render()}
function delEv(i){db.evs.splice(i,1);persist();render()}
function pullEv(){let n=0;KEYS.forEach(k=>db[k].forEach(r=>['Evg','Name_Presenter','First_Coming_Evangelist','Second_Coming_Evangelist'].forEach(f=>{const v=(r[f]||'').trim();if(v&&!db.evs.includes(v)){db.evs.push(v);n++}})));sortEv();flash='Added '+n+' name(s) from existing records';render()}
async function onImp(inp){const f=inp.files[0];inp.value='';if(!f)return;const R=parseCSV((await f.text()).replace(/^\uFEFF/,''));
if(impTab=='evs'){let n=0;R.forEach((r,i)=>{const v=(r[0]||'').trim();if(!v||(i==0&&/^(name|evangelist|evangelists|evangelist name)$/i.test(v)))return;if(!db.evs.includes(v)){db.evs.push(v);n++}});sortEv();flash='Imported '+n+' evangelist(s)'}
else{const S=SCH[impTab],nz=h=>h.toLowerCase().replace(/[^a-z0-9]/g,''),H=R[0].map(nz),ix=S.f.map(([n])=>H.indexOf(nz(n)));
if(ix.every(i=>i<0))flash='No matching column headings found. Tap Template to see the expected format.';
else{let n=0;R.slice(1).forEach(row=>{const r={};S.f.forEach(([nm],j)=>{r[nm]=ix[j]>=0?(row[ix[j]]||'').trim():''});
if(['fresh','home','travel'].includes(impTab)&&!r.Name)return;
S.f.forEach(([nm,t])=>{if(t=='id'&&!r[nm])r[nm]=nextId();if(t=='sl'&&!r[nm])r[nm]=String(Math.max(0,...db.travel.map(x=>+x.Sl_No||0))+1);if(t=='lid'&&!r[nm])r[nm]=nextLib()});
db[impTab].push(r);n++});flash='Imported '+n+' row(s) into '+S.t}}
persist();render()}
let snap={},busy=0,syncMsg='';
try{snap=JSON.parse(localStorage.getItem('zs_snap'))||{}}catch(e){}
const SK=[...KEYS,'evs'],rowsOf=k=>k=='evs'?db.evs.map(n=>({_id:'ev:'+n,Name:n,Email:((db.evm||{})[n]||{}).Email||'',Mobile:((db.evm||{})[n]||{}).Mobile||''})):db[k];
const hs=t=>{let h=5381;for(let i=0;i<t.length;i++)h=(h*33^t.charCodeAt(i))>>>0;return h.toString(36)};
function snapshot(){snap={};SK.forEach(k=>{snap[k]={};rowsOf(k).forEach(r=>snap[k][r._id]=hs(JSON.stringify(r)))});try{localStorage.setItem('zs_snap',JSON.stringify(snap))}catch(e){}}
function setMsg(m){syncMsg=m;const e=$('#sm');if(e)e.textContent=m}
async function api(body){const u=cfg.api;const r=await fetch(body?u:u+(u.includes('?')?'&':'?')+'action=all&key='+encodeURIComponent(cfg.key||''),body?{method:'POST',body:JSON.stringify({key:cfg.key,...body})}:{});const j=await r.json();if(j.error)throw new Error(j.error);return j}
function diff(){const ops=[];SK.forEach(k=>{const cur={};rowsOf(k).forEach(r=>{cur[r._id]=1;if((snap[k]||{})[r._id]!==hs(JSON.stringify(r)))ops.push({type:'upsert',sheet:k,row:r})});Object.keys(snap[k]||{}).forEach(id=>{if(!cur[id])ops.push({type:'delete',sheet:k,id})})});return ops}
async function flush(){if(!cfg.api||busy)return;const ops=diff();if(!ops.length)return;busy=1;try{for(let i=0;i<ops.length;i+=100)await api({ops:ops.slice(i,i+100)});snapshot();setMsg('Synced '+new Date().toLocaleTimeString())}catch(e){setMsg('Sync failed, will retry ('+e.message+')')}busy=0}
async function pull(){if(!cfg.api||busy)return;busy=1;try{const S=(await api()).sheets;if(SK.every(k=>!(S[k]||[]).length)&&KEYS.some(k=>db[k].length)){snap={};busy=0;await flush();return}SK.forEach(k=>{const a=S[k]||[];if(k=='evs'){db.evs=a.map(r=>r.Name).filter(Boolean);db.evm={};a.forEach(r=>{if(r.Name)db.evm[r.Name]={Mobile:r.Mobile||'',Email:r.Email||''}})}else db[k]=a});db.evs.sort((x,y)=>x.localeCompare(y));db.evsSeeded=1;try{localStorage.setItem('zs_v1',JSON.stringify(db))}catch(e){}snapshot();setMsg('Loaded from sheet '+new Date().toLocaleTimeString());if(!dlg.open)render()}catch(e){setMsg('Could not reach the sheet: '+e.message)}busy=0}
async function connect(){cfg.api=$('#sy_u').value.trim();cfg.key=$('#sy_k').value.trim();saveCfg();if(!cfg.api){setMsg('Enter the web app URL');return}setMsg('Connecting…');
try{const S=(await api()).sheets,n=Object.values(S).reduce((a,x)=>a+x.length,0);if(n>0)await pull();else{snap={};await flush()}}catch(e){setMsg('Could not connect: '+e.message);return}nav()}
async function pullNow(){await flush();await pull()}
async function upNow(){snap={};await flush()}
function disc(){cfg.api='';cfg.key='';saveCfg();render()}
function syncTab(){return syncTab0()+roleCard()}
function syncTab0(){return`<div class="card"><h2>Google Sheets sync</h2><p style="color:var(--mu);font-size:12px;margin:0 0 6px">Paste the web app URL and secret key from your Apps Script deployment. If the sheet already has data it replaces this device's data; if the sheet is empty, this device's data is uploaded.</p><label>Web app URL</label><input id="sy_u" style="width:100%" value="${esc(cfg.api||'')}" placeholder="https://script.google.com/macros/s/…/exec"><label>Secret key</label><input id="sy_k" type="password" style="width:100%" value="${esc(cfg.key||'')}"><div class="row" style="margin:14px 0 8px"><button class="btn" onclick="connect()">Save &amp; connect</button><button class="btn g" onclick="pullNow()">Sync now</button><button class="btn g" onclick="upNow()">Re-upload all</button>${cfg.api?'<button class="btn g" onclick="disc()">Disconnect</button>':''}</div><div id="sm" style="font-size:12px;color:var(--mu)">${esc(syncMsg)||(cfg.api?'Connected':'Not connected')}</div></div>`}
function roleCard(){return`<div class="card" style="margin-top:12px"><h2>${MANAGER?'Manager view is on':'Manager access'}</h2><p style="color:var(--mu);font-size:12px;margin:0 0 10px">${MANAGER?'This device shows the Dashboard, Reports and the travel ✓ check.':'Managers: enter your PIN to open the Dashboard, Reports and the travel check on this device.'}</p>${MANAGER?'<button class="btn g" onclick="mgrOut()">Switch to team view</button>':'<button class="btn" onclick="mgrIn()">Manager login</button>'}</div>`}
async function mgrIn(){if(!cfg.api){alert('Connect the Google Sheet first (fields above).');return}const pin=prompt('Manager PIN');if(!pin)return;
try{const r=await fetch(cfg.api+(cfg.api.includes('?')?'&':'?')+'action=auth&key='+encodeURIComponent(cfg.key||'')+'&pin='+encodeURIComponent(pin));const j=await r.json();if(j.error)throw new Error(j.error);if(!j.ok){alert('Wrong PIN');return}}catch(e){alert('Could not verify: '+e.message);return}
cfg.role='manager';saveCfg();MANAGER=true;evf='';tab='dash';render();pullNow()}
function mgrOut(){cfg.role='';saveCfg();MANAGER=false;evf=cfg.me||'';tab='my';render()}
let clrArm=0;
function clr(){if(!clrArm){clrArm=1;$('#clr').textContent='Tap again to erase all records';setTimeout(()=>{clrArm=0;const b=$('#clr');if(b)b.textContent='Clear all data'},4000);return}clrArm=0;['fresh','follow','content','home','sath','travel'].forEach(k=>db[k]=[]);persist();flash='All records cleared (evangelist list kept)';render()}
function render(keep){nav();HP.textContent=HP0+(MANAGER?' · Manager view':cfg.me?' · '+cfg.me:'');$('#ids').innerHTML=contacts().map(c=>`<option value="${c.Contact_ID}">${esc(c.Name)}</option>`).join('');
const y=scrollY,fm=flash;flash='';$('#app').innerHTML=(fm?`<div class="card" style="margin-bottom:12px;background:var(--pr2);color:var(--pr)">${esc(fm)}</div>`:'')+(tab=='my'?myDay():tab=='ticks'?ticks():tab=='dash'?dash():tab=='rem'?rem():tab=='rep'?rep():tab=='evs'?evs():tab=='sync'?syncTab():list())+(MANAGER&&!KEYS.some(k=>db[k].length)?`<div class="row" style="justify-content:center;margin-top:14px"><button class="btn g" onclick="seed()">Load sample data</button></div>`:'');
if(keep){const i=$('#app input');if(i){i.focus();i.setSelectionRange(99,99)}}scrollTo(0,y)}
const dtf=v=>v?v.replace('T',' '):'-';
function tmsg(t){return `*Sathvartha Travel Details*\n\nSl No: ${t.Sl_No}\nName: ${t.Name}\nFellowship Area: ${t.Fellowship_Area_Name||'-'}\nAge / Gender: ${t.Age||'-'} / ${t.Gender||'-'}\nAddress: ${t.Address||'-'}\nPhone: ${t.Phone_No||'-'}\nReference: ${t.Reference_Name||'-'}\nEvangelists (1st & 2nd coming): ${[t.First_Coming_Evangelist,t.Second_Coming_Evangelist].filter(Boolean).join(' & ')||'-'}\nDenomination / Religion: ${t.Denomination||'-'} / ${t.Religion||'-'}\nLanguage: ${t.Language||'-'}\n\nOnward train: ${t.Onward_Train_Details||'-'}\nArrival: ${dtf(t.Arrival_Date_Time)}\nReturn train: ${t.Return_Train_Details||'-'}\nDeparture: ${dtf(t.Departure_Date_Time)}`}
function mkTravel(r){const id=r.Contact_ID,fr=db.fresh.find(x=>x.Contact_ID==id)||{},hm=db.home.find(x=>x.Contact_ID==id)||{};
const first=r.Evg||fr.Evg||hm.Name_Presenter||'';
const second=[...db.follow,...db.content].filter(x=>x.Contact_ID==id&&x.Evg&&x.Evg!=first).map(x=>x.Evg)[0]||'';
return{Sl_No:String(Math.max(0,...db.travel.map(t=>+t.Sl_No||0))+1),Fellowship_Area_Name:r.Fellowship||fr.Fellowship||hm.Fellowship_Area||'',Name:r.Name||fr.Name||hm.Name||'',Age:'',Gender:'',Address:'',Phone_No:r.Mobile||fr.Mobile||hm.Mobile||'',Reference_Name:fr.Referred_By||fr.Reference||'',First_Coming_Evangelist:first,Second_Coming_Evangelist:second,Denomination:'',Religion:'',Onward_Train_Details:'',Arrival_Date_Time:'',Return_Train_Details:'',Departure_Date_Time:'',Language:hm.Language||'',Contact_ID:id}}
function tbar(){if(!MANAGER)return'<div class="card" style="margin-bottom:12px;color:var(--mu);font-size:12px">Complete every detail. The manager checks ✓ each record and sends it to the coordinator.</div>';const all=db.travel.filter(t=>t.Checked=='Yes').map(tmsg).join('\n\n———\n\n'),b='style="text-decoration:none"';
return`<div class="row"><input placeholder="Coordinator WhatsApp (e.g. 919876543210)" value="${esc(cfg.wa||'')}" onchange="cfg.wa=this.value.replace(/[^0-9]/g,'');saveCfg();render()" style="flex:1;min-width:150px"><input type="email" placeholder="Coordinator email" value="${esc(cfg.em||'')}" onchange="cfg.em=this.value.trim();saveCfg();render()" style="flex:1;min-width:150px"><a class="btn g" ${b} target="_blank" href="https://wa.me/${cfg.wa||''}?text=${encodeURIComponent(all)}">WhatsApp all checked</a><a class="btn g" ${b} href="mailto:${esc(cfg.em||'')}?subject=${encodeURIComponent('Sathvartha travel details')}&body=${encodeURIComponent(all)}">Email all checked</a></div>`}
function openF(k,i){cur=k;ed=i??null;const S=SCH[k],R=ed!=null?db[k][ed]:null;$('#dt').textContent=(R?'Edit · ':'Add · ')+S.t;
$('#df').innerHTML=S.f.map(([n,t,o])=>{const id='f_'+n,v=R?R[n]??'':(t=='ev'&&cfg.me&&['Evg','Name_Presenter','First_Coming_Evangelist'].includes(n)?cfg.me:''),l=`<label>${n.replace(/_/g,' ')}</label>`;
if(t=='id')return l+`<input id="${id}" value="${R?v:nextId()}" readonly>`;
if(t=='sl')return l+`<input id="${id}" value="${R?v:Math.max(0,...db.travel.map(r=>+r.Sl_No||0))+1}" readonly>`;
if(t=='lid')return l+`<input id="${id}" value="${R?v:nextLib()}" readonly>`;
if(t=='ta')return l+`<textarea id="${id}" rows="4">${esc(v)}</textarea><div class="row" style="margin:6px 0 0"><input type="file" id="lfile" onchange="upFile(this)" style="width:auto"><span id="lmsg" style="font-size:12px;color:var(--mu)">or paste text / a link above</span></div>`;
if(t=='lib'){const sel=new Set(String(v).split(/[^A-Za-z0-9-]+/).filter(Boolean));return`<label>Library content to share (pick one or more)</label><div id="${id}" style="max-height:180px;overflow:auto;border:1px solid var(--bd);border-radius:8px;padding:6px">${db.lib.length?db.lib.slice().sort((a,b)=>a.Section-b.Section).map(x=>`<label style="display:flex;gap:8px;align-items:center;margin:3px 0;color:var(--tx)" data-sec="${esc(x.Section)}"><input type="checkbox" value="${esc(x.Content_ID)}" ${sel.has(x.Content_ID)?'checked':''} style="width:auto"><span>§${esc(x.Section)} · ${esc(x.Title)}</span></label>`).join(''):'<span style="color:var(--mu);font-size:12px">No library content yet — add it in the Content Library tab.</span>'}</div>`}
if(t=='cid')return l+`<input id="${id}" list="ids" value="${esc(v)}" placeholder="e.g. ZS-0001" onchange="fill(this.value)">`;
if(t=='mc'){const sel=new Set(String(v).split(/[^0-9]+/).filter(Boolean));return`<label>Topics · choose one or more sections (1–${NSEC})</label><div id="${id}" class="chips">${Array.from({length:NSEC},(_,i)=>i+1).map(n=>`<label class="chip"><input type="checkbox" value="${n}" ${sel.has(String(n))?'checked':''} onchange="libFilter()"><span>${n}</span></label>`).join('')}</div><div id="cov" style="font-size:12px;color:var(--mu);margin-top:6px">${R&&R.Contact_ID?cover(R.Contact_ID):''}</div>`}
if(t=='ev'){if(!db.evs.length)return l+`<input id="${id}" value="${esc(v)}" placeholder="Type name, or add evangelists in the Evangelists tab">`;const L=v&&!db.evs.includes(v)?[v,...db.evs]:db.evs;return l+`<select id="${id}"><option value=""></option>${L.map(x=>`<option ${x==v?'selected':''}>${esc(x)}</option>`).join('')}</select>`}
if(t=='s'){const O=v&&!o.includes(v)?[...o,v]:o;return l+`<select id="${id}">${O.map(x=>`<option ${x==v?'selected':''}>${x}</option>`).join('')}</select>`}
return l+`<input id="${id}" type="${t=='dt'?'datetime-local':t}" value="${esc(v||(t=='date'&&!R?iso(0):''))}">`}).join('');dlg.showModal();libFilter()}
const cover=id=>{const S=new Set();db.content.filter(r=>r.Contact_ID==id).forEach(r=>String(r.Topics||'').split(/[^0-9]+/).filter(Boolean).forEach(n=>S.add(+n)));return S.size?'Already covered: '+[...S].sort((a,b)=>a-b).join(', '):'No sections covered yet'};
function fill(id){const cv=$('#cov');if(cv)cv.textContent=cover(id);const c=contacts().find(x=>x.Contact_ID==id);if(!c)return;['Name','Mobile','Fellowship','Evg'].forEach(k=>{const e=$('#f_'+k);if(e&&!e.value&&c[k]){if(e.tagName=='SELECT'&&![...e.options].some(o=>o.value==c[k]))e.add(new Option(c[k],c[k]));e.value=c[k]}})}
function save(){const r={};SCH[cur].f.forEach(([n,t])=>r[n]=(t=='mc'||t=='lib')?[...$('#f_'+n).querySelectorAll('input:checked')].map(x=>x.value).join(', '):$('#f_'+n).value.trim());
if(SCH[cur].f.some(f=>f[1]=='cid')&&!r.Contact_ID){alert('Enter a Contact ID');return}
if((cur=='fresh'||cur=='home'||cur=='travel')&&!r.Name){alert('Name is required');return}
if(cur=='lib'){if(!r.Title||!r.Content){alert('Title and content / link are required');return}r.Updated=iso(0)}
let made=-1;
if(ed!=null){const o=db[cur][ed];r._id=o._id;if(cur=='travel'&&o.Checked=='Yes'&&!SCH.travel.f.some(([n])=>(o[n]||'')!==(r[n]||''))){r.Checked=o.Checked;r.Checked_By=o.Checked_By;r.Checked_On=o.Checked_On}db[cur][ed]=r}else db[cur].push(r);
if(cur=='sath'&&r.Stage=='Ready For Sathvartha'&&!db.travel.some(t=>t.Contact_ID==r.Contact_ID)){db.travel.push(mkTravel(r));made=db.travel.length-1}
persist();dlg.close();if(made>=0){tab='travel';render();openF('travel',made)}else render()}
function del_(k,i){if(confirm('Delete this record?')){db[k].splice(i,1);persist();render()}}
function csv(k,tp){let cols=k=='rem'?['Contact_ID','Name','Mobile','Fellowship','Evg','Last_Activity','Days_Since','Level']:k=='rep'?[]:SCH[k].f.map(f=>f[0]);
let rows=k=='rem'?contacts().filter(c=>c.Level!='On track'&&c.Level!='—'):db[k];if(k=='rep'){const R=repData();cols=['Metric',...R.B.map(b=>b.l)];rows=R.rows.map(r=>Object.fromEntries(cols.map((c,i)=>[c,r[i]])))}
if(tp)rows=[];const t=[cols.map(c=>c.replace(/_/g,' ')).join(',')].concat(rows.map(r=>cols.map(c=>'"'+String(r[c]??'').replace(/"/g,'""')+'"').join(','))).join('\n');
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download='zion_'+k+(tp?'_template':'')+'.csv';a.click()}
function seed(){db.fresh=[{Contact_ID:'ZS-0001',Type:'Call',Date:iso(-35),Name:'Joseph Mathew',Mobile:'9800000001',Reference:'Tele call',Fellowship:'Whitefield',Evg:'Sajan Bernard',Status:'Positive'},
{Contact_ID:'ZS-0002',Type:'Visit',Date:iso(-16),Name:'Anitha R',Mobile:'9800000002',Reference:'D2D',Fellowship:'Whitefield',Evg:'Ruth',Status:'Neutral'},
{Contact_ID:'ZS-0003',Type:'Call',Date:iso(-8),Name:'Suresh K',Mobile:'9800000003',Reference:'Bible Quiz',Fellowship:'Marathahalli',Evg:'Sajan Bernard',Status:'Busy'},
{Contact_ID:'ZS-0004',Type:'Visit',Date:iso(-1),Name:'Meera P',Mobile:'9800000004',Reference:'Card Service',Fellowship:'Marathahalli',Evg:'Ruth',Status:'Positive'}];
db.follow=[{Contact_ID:'ZS-0002',Type:'Call',Date:iso(-3),Name:'Anitha R',Mobile:'9800000002',Fellowship:'Whitefield',Evg:'Ruth',Status:'Signs Of Times'}];
db.content=[{Contact_ID:'ZS-0002',Type:'Visit',Date:iso(-2),Mobile:'9800000002',Reference:'D2D',Fellowship:'Whitefield',Evg:'Ruth',Status:'Signs Of Times',Topics:'1, 2, 3'}];
db.home=[{Date:iso(-2),Language:'Kannada',Name:'Ravi S',Mobile:'9800000005',Name_Presenter:'Sajan Bernard',Fellowship_Area:'Whitefield',Contact_ID:'ZS-0005'}];
db.sath=[{Contact_ID:'ZS-0004',Stage:'Ready For Sathvartha',Date:iso(-120),Name:'Meera P',Mobile:'9800000004',Fellowship:'Marathahalli',Evg:'Ruth'},{Contact_ID:'ZS-0004',Stage:'Attended Sathvartha',Date:iso(-105),Name:'Meera P',Mobile:'9800000004',Fellowship:'Marathahalli',Evg:'Ruth'},{Contact_ID:'ZS-0004',Stage:'In Fellowship',Date:iso(-100),Name:'Meera P',Mobile:'9800000004',Fellowship:'Marathahalli',Evg:'Ruth'},{Contact_ID:'ZS-0001',Stage:'Ready For Sathvartha',Date:iso(-4),Name:'Joseph Mathew',Mobile:'9800000001',Fellowship:'Whitefield',Evg:'Sajan Bernard'}];db.travel=[mkTravel({Contact_ID:'ZS-0001'})];persist();render()}
render();
if(cfg.api){flush().then(pull)}
setInterval(()=>{if(cfg.api&&!dlg.open&&!busy)flush().then(pull)},30000);
addEventListener('visibilitychange',()=>{if(!document.hidden&&cfg.api&&!dlg.open&&!busy)flush().then(pull)});
