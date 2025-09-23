export const STORAGE_KEY = 'mailcraft_templates_v1';
export const BRAND_KEY = 'mailcraft_brands_v1';


export function loadTemplates(){
try{
const raw = localStorage.getItem(STORAGE_KEY);
if(!raw) return [];
return JSON.parse(raw);
}catch(e){
console.error('loadTemplates', e);
return [];
}
}


export function saveTemplates(list){
try{
localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}catch(e){
console.error('saveTemplates', e);
}
}


export function loadBrands(){
try{
const raw = localStorage.getItem(BRAND_KEY);
if(!raw) return ['Default'];
return JSON.parse(raw);
}catch(e){
console.error('loadBrands', e);
return ['Default'];
}
}


export function saveBrands(list){
try{
localStorage.setItem(BRAND_KEY, JSON.stringify(list));
}catch(e){
console.error('saveBrands', e);
}
}


export function generateId(existing = []){
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let id = '';
let attempts = 0;
do{
id = Array.from({length:8}).map(()=>chars[Math.floor(Math.random()*chars.length)]).join('');
attempts++;
if(attempts>50) break;
}while(existing.some(t=>t.id===id));
return id;
}