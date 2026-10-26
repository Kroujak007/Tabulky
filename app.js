const KEY='kalorie.web.v1';
const meals=['Snídaně','Oběd','Večeře','Svačina'];
const seedFoods=[
 {id:'oats',name:'Ovesné vločky',brand:'',kcal:372,p:13.5,c:58.7,f:7,source:'Vlastní databáze'},
 {id:'banana',name:'Banán',brand:'',kcal:89,p:1.1,c:22.8,f:.3,source:'Vlastní databáze'},
 {id:'egg',name:'Vejce',brand:'',kcal:143,p:12.6,c:.7,f:9.5,source:'Vlastní databáze'},
 {id:'chicken',name:'Kuřecí prsa, syrová',brand:'',kcal:120,p:22.5,c:0,f:2.6,source:'Vlastní databáze'},
 {id:'rice',name:'Rýže, vařená',brand:'',kcal:130,p:2.7,c:28.2,f:.3,source:'Vlastní databáze'},
 {id:'skyr',name:'Skyr bílý',brand:'',kcal:63,p:11,c:4,f:.2,source:'Vlastní databáze'},
 {id:'quark',name:'Tvaroh nízkotučný',brand:'',kcal:67,p:12,c:4,f:.2,source:'Vlastní databáze'},
 {id:'bread',name:'Celozrnný chléb',brand:'',kcal:247,p:9,c:41,f:4.2,source:'Vlastní databáze'},
 {id:'potato',name:'Brambory vařené',brand:'',kcal:87,p:1.9,c:20.1,f:.1,source:'Vlastní databáze'}
];
// fix explicit seed value below so data remains valid
seedFoods[8].kcal=87;
let state=loadState();
let selectedDate=isoDate(new Date());
let selectedMeal='Snídaně';
let searchTimer;
const $=id=>document.getElementById(id);
function freshState(){return {settings:{kcal:2300,p:160,c:250,f:75},foods:seedFoods.map(x=>({...x})),entries:[],recipes:[],weights:[]};}
function loadState(){try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);return {...freshState(),...s,settings:{...freshState().settings,...s.settings}}}}catch(e){}return freshState()}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}
function isoDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function fmt(n,d=0){return Number(n||0).toLocaleString('cs-CZ',{maximumFractionDigits:d,minimumFractionDigits:d})}
function escapeHTML(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dateObj(s){return new Date(`${s}T12:00:00`)}
function dateLabel(s){const d=dateObj(s);return d.toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function isToday(s){return s===isoDate(new Date())}
function entriesForDay(){return state.entries.filter(e=>e.date===selectedDate)}
function totals(items){return items.reduce((a,e)=>{const ratio=(e.grams||0)/100;return {kcal:a.kcal+(e.kcal||0)*ratio,p:a.p+(e.p||0)*ratio,c:a.c+(e.c||0)*ratio,f:a.f+(e.f||0)*ratio}}, {kcal:0,p:0,c:0,f:0})}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2400)}
function render(){renderDashboard();renderDiary();renderRecipes();renderWeight();syncSettings()}
function renderDashboard(){
 const items=entriesForDay(),t=totals(items),g=state.settings;
 $('dateLabel').textContent=isToday(selectedDate)?'Dnes · '+dateLabel(selectedDate):dateLabel(selectedDate);
 $('consumed').textContent=fmt(t.kcal);$('remaining').textContent=fmt(g.kcal-t.kcal);$('percent').textContent=fmt(t.kcal/Math.max(1,g.kcal)*100)+' % cíle';$('goalPill').textContent='Denní cíl '+fmt(g.kcal)+' kcal';
 $('calorieProgress').style.width=Math.min(100,t.kcal/Math.max(1,g.kcal)*100)+'%';
 for(const [id,key,target] of [['protein','p',g.p],['carbs','c',g.c],['fat','f',g.f]]){$(id).textContent=fmt(t[key]);$(id+'Bar').style.width=Math.min(100,t[key]/Math.max(1,target)*100)+'%'}
 $('homeMeals').innerHTML=meals.map(meal=>mealCard(meal,items.filter(e=>e.meal===meal),false)).join('');
}
function mealCard(meal,items,showDelete=true){
 const t=totals(items);
 return `<div class="meal-card"><div class="meal-card-head"><span class="meal-name">${meal}</span><span class="meal-total">${fmt(t.kcal)} kcal</span></div>${items.length?items.map(e=>`<div class="meal-entry"><div><div class="entry-title">${escapeHTML(e.name)}</div><div class="entry-sub">${fmt(e.grams,1)} g · B ${fmt(e.p*e.grams/100,1)} · S ${fmt(e.c*e.grams/100,1)} · T ${fmt(e.f*e.grams/100,1)}</div></div><div style="display:flex;align-items:center;gap:8px"><span class="entry-kcal">${fmt(e.kcal*e.grams/100)} kcal</span>${showDelete?`<button aria-label="Smazat" data-delete-entry="${e.id}" style="border:0;background:none;color:#ef8585;font-size:18px">×</button>`:''}</div></div>`).join(''):`<div class="empty-meal">Zatím tu nic není.</div>`}</div>`;
}
function renderDiary(){
 $('diaryMeals').innerHTML=mealCard(selectedMeal,entriesForDay().filter(e=>e.meal===selectedMeal),true);
 document.querySelectorAll('#mealTabs button').forEach(b=>b.classList.toggle('selected',b.dataset.meal===selectedMeal));
}
function renderRecipes(){
 $('recipeList').innerHTML=state.recipes.length?state.recipes.map(r=>`<div class="recipe-card"><div class="recipe-card-head"><h3>${escapeHTML(r.name)}</h3><span class="muted">${r.servings} porcí</span></div>${r.notes?`<p>${escapeHTML(r.notes)}</p>`:''}<div class="recipe-stats">${fmt(r.kcal)} kcal / porce · B ${fmt(r.p,1)} g · S ${fmt(r.c,1)} g · T ${fmt(r.f,1)} g</div><div class="recipe-actions"><button data-add-recipe="${r.id}">＋ Přidat do jídelníčku</button><button data-delete-recipe="${r.id}">Smazat</button></div></div>`).join(''):'<div class="empty-state">Zatím tu nemáš žádné recepty.<br>Vytvoř si první recept a ulož si jeho hodnoty na porci.</div>';
}
function renderWeight(){
 const sorted=[...state.weights].sort((a,b)=>a.date.localeCompare(b.date));
 const latest=sorted[sorted.length-1];
 $('latestWeight').textContent=latest?fmt(latest.kg,1):'—';
 if(sorted.length>1){const delta=latest.kg-sorted[0].kg;$('weightDelta').textContent=(delta>0?'+':'')+fmt(delta,1)+' kg od prvního záznamu'}else $('weightDelta').textContent=latest?'První záznam uložen':'Přidej první vážení';
 const vals=sorted.slice(-12),min=vals.length?Math.min(...vals.map(x=>x.kg))-1:0,max=vals.length?Math.max(...vals.map(x=>x.kg))+1:1;
 $('weightChart').innerHTML=vals.length?vals.map(w=>`<div class="chart-bar" style="height:${Math.max(12,((w.kg-min)/(max-min))*84)}px" title="${fmt(w.kg,1)} kg"><span>${new Date(w.date+'T12:00:00').toLocaleDateString('cs-CZ',{day:'numeric',month:'numeric'})}</span></div>`).join(''):'<div class="empty-state" style="width:100%">Po zapsání váhy se zde zobrazí graf.</div>';
 $('weightHistory').innerHTML=[...sorted].reverse().map(w=>`<div class="history-row"><span>${dateLabel(w.date)}</span><strong>${fmt(w.kg,1)} kg</strong><button data-delete-weight="${w.id}">Smazat</button></div>`).join('');
}
function syncSettings(){ $('calorieGoalInput').value=state.settings.kcal;$('proteinGoalInput').value=state.settings.p;$('carbsGoalInput').value=state.settings.c;$('fatGoalInput').value=state.settings.f; }
function navigate(page){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));if(page==='home')renderDashboard();window.scrollTo({top:0,behavior:'smooth'})}
function openModal(title,eyebrow,html){$('modalTitle').textContent=title;$('modalEyebrow').textContent=eyebrow;$('modalBody').innerHTML=html;$('modalBackdrop').classList.add('open')}
function closeModal(){$('modalBackdrop').classList.remove('open')}
function addFood(food,grams,meal=selectedMeal,date=selectedDate){state.entries.push({id:uid(),date,meal,name:food.name,grams:Number(grams),kcal:Number(food.kcal)||0,p:Number(food.p)||0,c:Number(food.c)||0,f:Number(food.f)||0});save();render();closeModal();toast('Jídlo přidáno do jídelníčku')}
function addFoodModal(food){
 openModal('Přidat potravinu','GRAMÁŽ A PORCE',`<form id="addFoodForm"><div class="settings-card"><div><strong>${escapeHTML(food.name)}</strong><small>${fmt(food.kcal)} kcal / 100 g · B ${fmt(food.p,1)} · S ${fmt(food.c,1)} · T ${fmt(food.f,1)}</small></div></div><label>Množství v gramech<input name="grams" type="number" min="1" max="10000" value="100" required></label><label>Zařadit do<select name="meal">${meals.map(m=>`<option ${m===selectedMeal?'selected':''}>${m}</option>`).join('')}</select></label><button class="primary-button" type="submit">Přidat do jídelníčku</button></form>`);
 $('addFoodForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);addFood(food,Number(fd.get('grams')),fd.get('meal'))};
}
function showSearchResults(items){
 $('searchResults').innerHTML=items.length?items.slice(0,10).map(f=>`<div class="food-result"><div><strong>${escapeHTML(f.name)}</strong><small>${escapeHTML(f.brand||f.source||'Potravina')} · ${fmt(f.kcal)} kcal / 100 g · B ${fmt(f.p,1)} g</small></div><button data-select-food="${f.id}">＋ Přidat</button></div>`).join(''):'<div class="no-results">Nic nenalezeno. Zkus jiný název nebo přidej vlastní potravinu.</div>';
}
function searchFoods(q){const query=q.trim().toLocaleLowerCase('cs');if(!query){$('searchResults').innerHTML='';return}showSearchResults(state.foods.filter(f=>(f.name+' '+(f.brand||'')).toLocaleLowerCase('cs').includes(query)))}
async function lookupOpenFoodFacts(query,isBarcode=false){
 const url=isBarcode?`https://world.openfoodfacts.org/api/v3/product/${encodeURIComponent(query)}.json?fields=product_name,brands,nutriments,code`:`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments,code`;
 $('searchResults').innerHTML='<div class="no-results">Hledám v databázi potravin…</div>';
 try{
  const response=await fetch(url,{headers:{'User-Agent':'KalorieWeb/1.0'}});
  if(!response.ok)throw new Error('Chyba připojení');
  const data=await response.json();
  const products=isBarcode?(data.status===1&&data.product?[data.product]:[]):(data.products||[]);
  const foods=products.map(p=>{const n=p.nutriments||{};return {id:'off-'+(p.code||uid()),name:p.product_name||'Neznámý produkt',brand:p.brands||'Open Food Facts',barcode:p.code||'',kcal:Number(n['energy-kcal_100g']??(n['energy_100g']?n['energy_100g']/4.184:0)),p:Number(n.proteins_100g)||0,c:Number(n.carbohydrates_100g)||0,f:Number(n.fat_100g)||0,source:'Open Food Facts'}}).filter(f=>f.kcal>0);
  if(!foods.length){$('searchResults').innerHTML='<div class="no-results">Produkt se nepodařilo najít nebo nemá vyplněné nutriční údaje. Můžeš ho přidat ručně.</div>';return}
  foods.forEach(f=>{if(!state.foods.some(x=>x.barcode&&x.barcode===f.barcode))state.foods.push(f)});
  save();showSearchResults(foods);
 }catch(e){$('searchResults').innerHTML='<div class="no-results">Databáze není dostupná. Zkontroluj připojení nebo přidej potravinu ručně.</div>'}
}
function openManualFood(){openModal('Vlastní potravina','DOPLŇ ÚDAJE NA 100 G',`<form id="manualFoodForm"><label>Název potraviny<input name="name" required placeholder="Např. domácí granola"></label><div class="two-col"><label>Kalorie (kcal)<input name="kcal" type="number" min="0" step=".1" required></label><label>Bílkoviny (g)<input name="p" type="number" min="0" step=".1" value="0"></label><label>Sacharidy (g)<input name="c" type="number" min="0" step=".1" value="0"></label><label>Tuky (g)<input name="f" type="number" min="0" step=".1" value="0"></label></div><label>Gramáž, kterou chceš zapsat<input name="grams" type="number" min="1" value="100" required></label><label>Jídlo<select name="meal">${meals.map(m=>`<option ${m===selectedMeal?'selected':''}>${m}</option>`).join('')}</select></label><button class="primary-button" type="submit">Uložit potravinu a přidat</button></form>`);
 $('manualFoodForm').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const f={id:uid(),name:d.name.trim(),kcal:+d.kcal,p:+d.p||0,c:+d.c||0,f:+d.f||0,source:'Vlastní potravina'};state.foods.push(f);addFood(f,+d.grams,d.meal)};
}
function openRecipeModal(){openModal('Nový recept','VLASTNÍ RECEPTURA',`<form id="recipeForm"><label>Název receptu<input name="name" required placeholder="Např. Proteinové lívance"></label><label>Ingredience / poznámka<textarea name="notes" rows="2" placeholder="Co do receptu patří…"></textarea></label><label>Počet porcí<input name="servings" type="number" min="1" value="1" required></label><div class="helper">Zadej nutriční hodnoty na jednu porci. Automatické sčítání ingrediencí doplníme v další iteraci.</div><div class="two-col"><label>Kalorie (kcal)<input name="kcal" type="number" min="0" value="0" required></label><label>Bílkoviny (g)<input name="p" type="number" min="0" value="0"></label><label>Sacharidy (g)<input name="c" type="number" min="0" value="0"></label><label>Tuky (g)<input name="f" type="number" min="0" value="0"></label></div><button class="primary-button" type="submit">Uložit recept</button></form>`);
 $('recipeForm').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));state.recipes.push({id:uid(),name:d.name.trim(),notes:d.notes,servings:+d.servings,kcal:+d.kcal,p:+d.p||0,c:+d.c||0,f:+d.f||0});save();renderRecipes();closeModal();toast('Recept uložen')};
}
function exportBackup(){const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`kalorie-zaloha-${isoDate(new Date())}.json`;a.click();URL.revokeObjectURL(a.href);toast('Záloha připravena')}
function importBackup(file){const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const s=parsed.state||parsed;if(!Array.isArray(s.entries)||!Array.isArray(s.foods))throw new Error();state={...freshState(),...s,settings:{...freshState().settings,...s.settings}};save();render();toast('Záloha úspěšně obnovena')}catch(e){toast('Soubor zálohy není platný')}};reader.readAsText(file)}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
$('prevDay').onclick=()=>{const d=dateObj(selectedDate);d.setDate(d.getDate()-1);selectedDate=isoDate(d);renderDashboard();renderDiary()};
$('nextDay').onclick=()=>{const d=dateObj(selectedDate);d.setDate(d.getDate()+1);selectedDate=isoDate(d);renderDashboard();renderDiary()};
$('quickAdd').onclick=()=>{navigate('diary');$('foodSearch').focus()};
$('quickWeight').onclick=()=>{navigate('weight');$('weightInput').focus()};
$('settingsBtn').onclick=()=>navigate('health');
$('foodSearch').addEventListener('input',e=>{clearTimeout(searchTimer);const q=e.target.value;searchFoods(q);if(q.trim().length>=3)searchTimer=setTimeout(()=>lookupOpenFoodFacts(q),650)});
$('barcodeBtn').onclick=()=>{openModal('Najít podle čárového kódu','EAN / UPC',`<form id="barcodeForm"><label>Číselný kód z obalu<input name="barcode" inputmode="numeric" pattern="[0-9]+" required placeholder="Např. 859…"></label><p class="helper">Tato verze vyhledává kód v databázi. Přímé skenování kamerou v Safari není na všech iPhonech spolehlivě podporované.</p><button class="primary-button" type="submit">Vyhledat produkt</button></form>`);$('barcodeForm').onsubmit=e=>{e.preventDefault();const code=new FormData(e.target).get('barcode');closeModal();navigate('diary');lookupOpenFoodFacts(code,true)}};
$('manualFoodBtn').onclick=openManualFood;$('newRecipeBtn').onclick=openRecipeModal;
$('mealTabs').onclick=e=>{const b=e.target.closest('[data-meal]');if(!b)return;selectedMeal=b.dataset.meal;renderDiary()};
document.body.addEventListener('click',e=>{
 const foodBtn=e.target.closest('[data-select-food]');if(foodBtn){const f=state.foods.find(x=>x.id===foodBtn.dataset.selectFood);if(f)addFoodModal(f)}
 const del=e.target.closest('[data-delete-entry]');if(del){state.entries=state.entries.filter(x=>x.id!==del.dataset.deleteEntry);save();render();toast('Záznam smazán')}
 const dr=e.target.closest('[data-delete-recipe]');if(dr){state.recipes=state.recipes.filter(x=>x.id!==dr.dataset.deleteRecipe);save();renderRecipes();toast('Recept smazán')}
 const ar=e.target.closest('[data-add-recipe]');if(ar){const r=state.recipes.find(x=>x.id===ar.dataset.addRecipe);if(r)addFood({name:r.name,kcal:r.kcal,p:r.p,c:r.c,f:r.f},100,selectedMeal)}
 const dw=e.target.closest('[data-delete-weight]');if(dw){state.weights=state.weights.filter(x=>x.id!==dw.dataset.deleteWeight);save();renderWeight()}
});
$('weightForm').onsubmit=e=>{e.preventDefault();const kg=Number($('weightInput').value.replace(',','.'));if(!kg||kg<20||kg>400){toast('Zkontroluj zadanou hmotnost');return}state.weights.push({id:uid(),date:isoDate(new Date()),kg});save();$('weightInput').value='';renderWeight();toast('Vážení uloženo')};
$('saveSettings').onclick=()=>{const g={kcal:+$('calorieGoalInput').value,p:+$('proteinGoalInput').value,c:+$('carbsGoalInput').value,f:+$('fatGoalInput').value};if(g.kcal<500||g.kcal>8000||g.p<10||g.c<10||g.f<10){toast('Zkontroluj cíle');return}state.settings=g;save();renderDashboard();toast('Cíle uloženy')};
$('exportData').onclick=exportBackup;$('importData').onchange=e=>{if(e.target.files[0])importBackup(e.target.files[0]);e.target.value=''};
$('clearData').onclick=()=>{if(confirm('Opravdu chceš smazat všechna uložená jídla, recepty a vážení? Tuto akci nelze vrátit.')){state=freshState();save();render();toast('Data smazána')}};
$('closeModal').onclick=closeModal;$('modalBackdrop').onclick=e=>{if(e.target===$('modalBackdrop'))closeModal()};
window.addEventListener('storage',e=>{if(e.key===KEY){state=loadState();render()}});
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
