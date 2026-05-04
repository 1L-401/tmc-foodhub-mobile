const API_BASE_URL='https://foodhub.tmc-innovations.com/api';  
const API_PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api$/i, '');  
const resolveApiMediaUrl = (path) => { if (/https?:\/\//i.test(path)) { const pUrl = new URL(path); if(pUrl.hostname === 'localhost') return ${API_PUBLIC_BASE_URL}; return path; } return ${API_PUBLIC_BASE_URL}/; };  
console.log(API_PUBLIC_BASE_URL);  
console.log(resolveApiMediaUrl('http://localhost:8081/assets/images'));  
