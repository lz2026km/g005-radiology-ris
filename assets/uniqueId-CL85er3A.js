let t=0;function i(n="id"){t=(t+1)%Number.MAX_SAFE_INTEGER;const o=Date.now().toString(36),r=t.toString(36),e=Math.random().toString(36).slice(2,7);return`${n}-${o}-${r}-${e}`}export{i as u};
