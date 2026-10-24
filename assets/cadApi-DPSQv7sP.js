import{f as e}from"./index-BkmoGRoE.js";const c={detect:t=>e.post("/ai/cad/detect",{instanceId:t}),getResult:t=>e.get(`/ai/cad/result/${encodeURIComponent(t)}`)};export{c};
