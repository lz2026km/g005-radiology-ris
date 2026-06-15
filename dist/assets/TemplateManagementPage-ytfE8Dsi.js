import{j as e}from"./index-DG8UPtQf.js";import{f as le,r as i}from"./react-vendor-SDrHJQRK.js";import{g as A,a_ as ne,W as de,d6 as ce,d7 as pe,p as xe,aF as ge,j as X,af as w,y as F,ae as E,as as V,aO as ue,bd as he,m as ye,X as P,bS as G,l as O,aB as me,aS as be,bQ as ve,b9 as Ce}from"./charts-vendor-B-I3XwWQ.js";import"./dicom-vendor-2w_o0_dO.js";import"./utils-vendor-lYPPEinu.js";const s={primary:"#1e40af",primaryLight:"#3b82f6",primaryLighter:"#dbeafe",accent:"#0891b2",white:"#ffffff",bg:"#e8e8e8",bgLight:"#f5f5f5",border:"#d4d4d4",borderLight:"#e5e5e5",textDark:"#1f2937",textMid:"#4b5563",textLight:"#9ca3af",success:"#059669",successLight:"#d1fae5",warning:"#d97706",danger:"#dc2626"},je=[{id:"tpl-001",code:"CT-BRAIN-001",name:"颅脑CT平扫模板",modality:"CT",category:"颅脑",subCategory:"平扫",content:`【检查技术】
扫描参数：层厚5mm，层间距5mm，FOV 25cm
扫描范围：颅顶至颅底

【影像表现】
1. 脑实质密度：未见异常密度影
2. 脑室系统：形态、大小正常
3. 中线结构：居中
4. 脑沟脑裂：未见增宽
5. 颅骨：骨质结构完整，未见骨折

【诊断意见】
颅脑CT平扫未见明显异常`,tags:["颅脑","平扫","常规"],author:"张明",createTime:"2024-01-15 10:30",updateTime:"2024-03-20 14:22",usageCount:1256,status:"active",version:"v2.1"},{id:"tpl-002",code:"CT-CHEST-001",name:"胸部CT平扫模板",modality:"CT",category:"胸部",subCategory:"平扫",content:`【检查技术】
扫描参数：层厚5mm，层间距5mm，FOV 38cm
扫描范围：肺尖至肺底

【影像表现】
1. 肺野：双肺纹理清晰，未见实变影
2. 胸膜：胸膜无增厚，胸腔无积液
3. 纵隔：纵隔结构清晰，无肿大淋巴结
4. 心影：形态、大小正常
5. 胸廓：骨质结构完整

【诊断意见】
胸部CT平扫未见明显异常`,tags:["胸部","平扫","常规"],author:"李华",createTime:"2024-01-18 09:15",updateTime:"2024-04-10 11:30",usageCount:982,status:"active",version:"v2.0"},{id:"tpl-003",code:"CT-ABD-001",name:"腹部CT平扫模板",modality:"CT",category:"腹部",subCategory:"平扫",content:`【检查技术】
扫描参数：层厚5mm，层间距5mm，FOV 35cm
扫描范围：膈顶至髂嵴

【影像表现】
1. 肝脏：形态、大小正常，密度均匀
2. 胆囊：壁不厚，腔内未见结石
3. 脾脏：大小、形态正常
4. 胰腺：轮廓清晰，未见异常
5. 肾脏：双肾形态正常，未见结石
6. 腹膜后：未见肿大淋巴结

【诊断意见】
腹部CT平扫未见明显异常`,tags:["腹部","平扫","常规"],author:"王芳",createTime:"2024-02-01 14:00",updateTime:"2024-04-15 16:45",usageCount:845,status:"active",version:"v1.8"},{id:"tpl-004",code:"CT-Spine-001",name:"颈椎CT平扫模板",modality:"CT",category:"脊柱",subCategory:"颈椎",content:`【检查技术】
扫描参数：层厚2mm，层间距2mm，FOV 20cm
扫描范围：C1-C7

【影像表现】
1. 椎体：各椎体形态正常，骨质结构完整
2. 椎间盘：未见突出或膨出
3. 椎管：形态、宽度正常
4. 韧带：未见钙化或肥厚
5. 软组织：未见异常密度影

【诊断意见】
颈椎CT平扫未见明显异常`,tags:["脊柱","颈椎","平扫"],author:"刘强",createTime:"2024-02-10 11:20",updateTime:"2024-03-25 09:30",usageCount:567,status:"active",version:"v1.5"},{id:"tpl-005",code:"MRI-BRAIN-001",name:"颅脑MRI平扫模板",modality:"MRI",category:"颅脑",subCategory:"平扫",content:`【检查技术】
扫描序列：T1WI、T2WI、FLAIR、DWI
层厚：5mm，层间距：1mm

【影像表现】
1. 脑实质：未见异常信号灶
2. 脑室系统：形态、大小正常
3. 中线结构：居中
4. 脑沟脑裂：未见增宽或变窄
5. 颅骨：未见异常信号

【诊断意见】
颅脑MRI平扫未见明显异常`,tags:["颅脑","平扫","MRI","常规"],author:"张明",createTime:"2024-02-15 08:45",updateTime:"2024-04-18 10:15",usageCount:723,status:"active",version:"v2.2"},{id:"tpl-006",code:"MRI-KNEE-001",name:"膝关节MRI模板",modality:"MRI",category:"关节",subCategory:"膝关节",content:`【检查技术】
扫描序列：T1WI、T2WI、PDWI、脂肪抑制
层厚：3mm

【影像表现】
1. 半月板：形态完整，未见撕裂信号
2. 交叉韧带：前/后交叉韧带连续性完好
3. 侧副韧带：内/外侧副韧带信号正常
4. 关节软骨：厚度均匀，信号未见异常
5. 关节腔：未见积液
6. 周围软组织：未见肿块

【诊断意见】
膝关节MRI未见明显异常`,tags:["关节","膝关节","MRI"],author:"陈静",createTime:"2024-02-20 15:30",updateTime:"2024-04-20 14:00",usageCount:456,status:"active",version:"v1.3"},{id:"tpl-007",code:"X-CHEST-001",name:"胸部X线正侧位模板",modality:"X线",category:"胸部",subCategory:"正侧位",content:`【检查技术】
投照体位：胸部正位、侧位
曝光参数：120kV，200mA

【影像表现】
1. 肺野：双肺纹理清晰，肺野透亮度正常
2. 肺门：结构清晰，无增大
3. 纵隔：纵隔居中，无增宽
4. 心影：形态、大小正常
5. 胸廓：双侧对称，肋骨骨质完整
6. 膈肌：双侧膈面光滑，肋膈角锐利

【诊断意见】
胸部X线片未见明显异常`,tags:["胸部","X线","正侧位"],author:"李华",createTime:"2024-02-25 10:00",updateTime:"2024-04-22 11:20",usageCount:1580,status:"active",version:"v3.0"},{id:"tpl-008",code:"X-SPINE-001",name:"腰椎X线正侧位模板",modality:"X线",category:"脊柱",subCategory:"腰椎",content:`【检查技术】
投照体位：腰椎正位、侧位、双斜位
曝光参数：75kV，400mA

【影像表现】
1. 椎体：L1-L5椎体形态正常，骨质结构完整
2. 椎间隙：椎间隙宽度正常
3. 椎弓根：双侧对称，未见骨折
4. 棘突：棘突连线居中
5. 软组织：椎旁软组织层次清晰

【诊断意见】
腰椎X线片未见明显异常`,tags:["脊柱","腰椎","X线"],author:"王芳",createTime:"2024-03-01 09:30",updateTime:"2024-04-25 15:40",usageCount:892,status:"active",version:"v2.1"},{id:"tpl-009",code:"CT-HEADCTA-001",name:"头颅CTA模板",modality:"CT",category:"颅脑",subCategory:"CTA",content:`【检查技术】
扫描参数：层厚0.625mm，FOV 20cm
对比剂：碘普罗胺350mgI/ml，80ml
注射速率：5ml/s

【影像表现】
1. 脑动脉：各分支走行自然，管腔未见狭窄或扩张
2. Willis环：环完整性好
3. 动脉瘤：未检出
4. 血管畸形：未见
5. 脑实质：未见出血或梗死

【诊断意见】
头颅CTA未见明显异常`,tags:["颅脑","CTA","血管"],author:"张明",createTime:"2024-03-05 14:20",updateTime:"2024-04-28 09:15",usageCount:345,status:"active",version:"v1.6"},{id:"tpl-010",code:"CT-ABDCE-001",name:"腹部增强CT模板",modality:"CT",category:"腹部",subCategory:"增强",content:`【检查技术】
扫描参数：层厚5mm，动脉期/静脉期/延迟期
对比剂：碘普罗胺350mgI/ml，100ml

【影像表现】
1. 动脉期：肝脏、脾脏动脉期强化均匀
2. 静脉期：门静脉、肝静脉显示清晰
3. 延迟期：胆囊、胆管未见异常
4. 肝脏：未见异常强化灶
5. 胰腺：强化均匀，胰管无扩张
6. 肾脏：皮质期、髓质期、分泌期正常

【诊断意见】
腹部增强CT未见明显异常`,tags:["腹部","增强","CT"],author:"刘强",createTime:"2024-03-10 11:45",updateTime:"2024-05-01 16:30",usageCount:412,status:"active",version:"v1.4"},{id:"tpl-011",code:"MRI-SPINE-001",name:"腰椎MRI模板",modality:"MRI",category:"脊柱",subCategory:"腰椎",content:`【检查技术】
扫描序列：T1WI、T2WI、脂肪抑制
层厚：4mm

【影像表现】
1. 椎体：L1-S1椎体形态正常，信号均匀
2. 椎间盘：T2WI信号正常，未见突出
3. 硬膜囊：形态正常，未受压
4. 神经根：未见水肿或受压
5. 椎管：未见狭窄
6. 周围软组织：未见异常

【诊断意见】
腰椎MRI平扫未见明显异常`,tags:["脊柱","腰椎","MRI"],author:"陈静",createTime:"2024-03-15 08:00",updateTime:"2024-05-05 10:20",usageCount:634,status:"active",version:"v2.0"},{id:"tpl-012",code:"X-PELVIS-001",name:"骨盆X线模板",modality:"X线",category:"骨盆",subCategory:"正位",content:`【检查技术】
投照体位：骨盆正位
曝光参数：80kV，300mA

【影像表现】
1. 髂骨：双侧形态对称，骨质结构完整
2. 耻骨联合：间隙正常
3. 髋臼：双侧形态对称，未见骨折
4. 股骨头：双侧形态规则，骨质完整
5. 关节间隙：双侧等宽，间隙正常
6. 软组织：未见异常钙化

【诊断意见】
骨盆X线片未见明显异常`,tags:["骨盆","X线","常规"],author:"李华",createTime:"2024-03-20 13:15",updateTime:"2024-05-08 14:45",usageCount:523,status:"active",version:"v1.7"},{id:"tpl-013",code:"CT-PELVIS-001",name:"盆腔CT平扫模板",modality:"CT",category:"盆腔",subCategory:"平扫",content:`【检查技术】
扫描参数：层厚5mm，层间距5mm
扫描范围：髂嵴至耻骨联合

【影像表现】
1. 膀胱：充盈良好，壁不厚
2. 前列腺/子宫：形态、大小正常
3. 直肠：肠壁无增厚
4. 盆腔淋巴结：未见肿大
5. 盆腔积液：未见
6. 骨骼：骨质结构完整

【诊断意见】
盆腔CT平扫未见明显异常`,tags:["盆腔","平扫","CT"],author:"王芳",createTime:"2024-03-25 10:30",updateTime:"2024-05-10 09:00",usageCount:398,status:"active",version:"v1.3"},{id:"tpl-014",code:"MRI-LIVER-001",name:"肝脏MRI平扫模板",modality:"MRI",category:"腹部",subCategory:"肝脏",content:`【检查技术】
扫描序列：T1WI、T2WI、DWI、脂肪抑制
层厚：5mm

【影像表现】
1. 肝脏：形态、大小正常，信号均匀
2. 肝内管道：走行自然，无扩张
3. 肝脏病变：未见异常信号灶
4. 胆道：肝内外胆管无扩张
5. 胆囊：壁不厚，腔内未见结石
6. 脾脏：大小、信号正常

【诊断意见】
肝脏MRI平扫未见明显异常`,tags:["腹部","肝脏","MRI"],author:"刘强",createTime:"2024-04-01 15:45",updateTime:"2024-05-12 11:30",usageCount:287,status:"active",version:"v1.2"},{id:"tpl-015",code:"X-SHOULDER-001",name:"肩关节X线模板",modality:"X线",category:"关节",subCategory:"肩关节",content:`【检查技术】
投照体位：肩关节正位、穿胸位
曝光参数：65kV，200mA

【影像表现】
1. 肱骨头：形态规则，骨质完整
2. 关节盂：未见骨质破坏
3. 肩峰：骨质结构完整
4. 软组织：未见异常钙化
5. 关节间隙：正常

【诊断意见】
肩关节X线片未见明显异常`,tags:["关节","肩关节","X线"],author:"陈静",createTime:"2024-04-05 09:00",updateTime:"2024-05-15 10:00",usageCount:345,status:"active",version:"v1.1"},{id:"tpl-016",code:"CT-SINUS-001",name:"副鼻窦CT模板",modality:"CT",category:"头颈",subCategory:"副鼻窦",content:`【检查技术】
扫描参数：层厚2mm，层间距2mm
扫描范围：额窦至上颌窦

【影像表现】
1. 上颌窦：黏膜无增厚，窦腔清晰
2. 筛窦：气化良好，未见密度增高
3. 额窦：窦腔清晰，骨质完整
4. 蝶窦：窦腔清晰，无占位
5. 鼻中隔：居中，无弯曲
6. 周围骨质：未见骨质破坏

【诊断意见】
副鼻窦CT平扫未见明显异常`,tags:["头颈","副鼻窦","CT"],author:"张明",createTime:"2024-04-10 14:30",updateTime:"2024-05-18 15:20",usageCount:432,status:"active",version:"v1.4"},{id:"tpl-017",code:"MRI-PROSTATE-001",name:"前列腺MRI模板",modality:"MRI",category:"盆腔",subCategory:"前列腺",content:`【检查技术】
扫描序列：T1WI、T2WI、DWI、脂肪抑制
层厚：3mm

【影像表现】
1. 前列腺：体积约30ml，信号均匀
2. 移行带：信号未见异常
3. 外周带：T2WI高信号，未见结节
4. 精囊腺：双侧对称，信号正常
5. 周围脂肪：清晰
6. 淋巴结：未见肿大

【诊断意见】
前列腺MRI平扫未见明显异常`,tags:["盆腔","前列腺","MRI"],author:"刘强",createTime:"2024-04-15 11:00",updateTime:"2024-05-20 09:45",usageCount:234,status:"active",version:"v1.0"},{id:"tpl-018",code:"X-ABDOMEN-001",name:"腹部X线立位片模板",modality:"X线",category:"腹部",subCategory:"立位片",content:`【检查技术】
投照体位：腹部立位
曝光参数：75kV，300mA

【影像表现】
1. 膈肌：双侧膈面光滑，肋膈角锐利
2. 肝脏：肝影正常
3. 脾脏：脾影正常
4. 肠管：未见气液平面
5. 腹腔：未见游离气体
6. 骨骼：腰椎、骨盆骨质完整

【诊断意见】
腹部X线立位片未见明显异常`,tags:["腹部","X线","立位"],author:"李华",createTime:"2024-04-20 10:15",updateTime:"2024-05-22 14:30",usageCount:678,status:"active",version:"v2.0"},{id:"tpl-019",code:"CT-ANGIO-001",name:"肺动脉CTA模板",modality:"CT",category:"胸部",subCategory:"CTA",content:`【检查技术】
扫描参数：层厚1mm，FOV 35cm
对比剂：碘普罗胺350mgI/ml，80ml
注射速率：4ml/s

【影像表现】
1. 肺动脉主干：未见栓塞
2. 左肺动脉：管腔通畅
3. 右肺动脉：管腔通畅
4. 叶段肺动脉：未见充盈缺损
5. 肺实质：未见梗死灶
6. 纵隔：未见肿大淋巴结

【诊断意见】
肺动脉CTA未见明显异常`,tags:["胸部","CTA","血管","肺动脉"],author:"王芳",createTime:"2024-04-25 08:30",updateTime:"2024-05-25 11:15",usageCount:189,status:"active",version:"v1.1"},{id:"tpl-020",code:"MRI-BREAST-001",name:"乳腺MRI平扫模板",modality:"MRI",category:"乳腺",subCategory:"平扫",content:`【检查技术】
扫描序列：T1WI、T2WI、脂肪抑制、DWI
层厚：3mm

【影像表现】
1. 双侧乳腺：腺体分布对称
2. 信号：T1WI呈中等信号，T2WI呈高信号
3. 肿块：未见异常强化肿块
4. 乳头：双侧对称，无内陷
5. 皮肤：未见增厚
6. 腋窝：淋巴结未见肿大

【诊断意见】
乳腺MRI平扫未见明显异常`,tags:["乳腺","MRI","平扫"],author:"陈静",createTime:"2024-04-30 13:00",updateTime:"2024-05-28 10:00",usageCount:156,status:"active",version:"v1.0"}],fe=()=>`tpl-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,S=g=>g.toLocaleString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});function ke(){const g=le(),[n,T]=i.useState(je),[d,$]=i.useState(""),[y,H]=i.useState("all"),[m,N]=i.useState("all"),[K,x]=i.useState(!1),[U,b]=i.useState(!1),[M,k]=i.useState("add"),[l,q]=i.useState(null),[o,r]=i.useState({code:"",name:"",modality:"CT",category:"",subCategory:"",content:"",tags:[],status:"active",version:"v1.0"}),[v,C]=i.useState(""),[c,u]=i.useState(1),[R,L]=i.useState(null),[z,B]=i.useState(null),I=10,Y=a=>{L(a),setTimeout(()=>L(null),2500)},j=i.useMemo(()=>n.filter(a=>{const p=d===""||a.name.toLowerCase().includes(d.toLowerCase())||a.code.toLowerCase().includes(d.toLowerCase())||a.tags.some(re=>re.toLowerCase().includes(d.toLowerCase()))||a.content.toLowerCase().includes(d.toLowerCase()),f=y==="all"||a.modality===y,ie=m==="all"||a.status===m;return p&&f&&ie}),[n,d,y,m]),W=i.useMemo(()=>{const a=(c-1)*I;return j.slice(a,a+I)},[j,c]),h=Math.ceil(j.length/I),Q=()=>{u(1)},_=()=>{k("add"),r({code:"",name:"",modality:"CT",category:"",subCategory:"",content:"",tags:[],status:"active",version:"v1.0"}),C(""),x(!0)},J=a=>{k("edit"),r({...a}),C(""),x(!0)},Z=a=>{q(a),b(!0)},ee=()=>{if(!o.code||!o.name||!o.content){B("请填写必填项（模板代码、名称、内容）"),setTimeout(()=>B(null),3e3);return}if(M==="add"){const a={...o,id:fe(),author:"当前用户",createTime:S(new Date),updateTime:S(new Date),usageCount:0};T([a,...n])}else T(n.map(a=>a.id===o.id?{...a,...o,updateTime:S(new Date)}:a));x(!1)},te=a=>{confirm("确定要删除该模板吗？")&&T(n.filter(p=>p.id!==a))},ae=a=>{navigator.clipboard.writeText(a),Y("已复制到剪贴板")},D=()=>{v.trim()&&o.tags&&!o.tags.includes(v.trim())&&(r({...o,tags:[...o.tags,v.trim()]}),C(""))},se=a=>{r({...o,tags:o.tags?.filter(p=>p!==a)||[]})},oe=a=>{switch(a){case"CT":return e.jsx(w,{size:16,style:{color:s.primary}});case"MRI":return e.jsx(F,{size:16,style:{color:s.accent}});case"X线":return e.jsx(E,{size:16,style:{color:s.success}});default:return e.jsx(O,{size:16})}};return e.jsxs("div",{style:t.container,children:[e.jsxs("div",{style:t.header,children:[e.jsxs("div",{style:t.headerLeft,children:[e.jsx(A,{size:28,style:{color:s.primary}}),e.jsx("h1",{style:t.title,children:"检查模板管理"})]}),e.jsxs("button",{style:t.addBtn,onClick:_,children:[e.jsx(ne,{size:18}),e.jsx("span",{children:"新增模板"})]}),e.jsxs("button",{onClick:()=>g("/template-designer"),style:{marginLeft:8,padding:"8px 14px",background:"linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",color:"#fff",border:"none",borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4,boxShadow:"0 2px 4px rgba(124, 58, 237, 0.3)"},children:[e.jsx(de,{size:16}),e.jsx("span",{children:"可视化设计器 (R2)"})]}),e.jsxs("button",{onClick:()=>g("/template-inheritance"),style:{marginLeft:8,padding:"8px 14px",background:"#fff",color:"#1e40af",border:"1px solid #3b82f6",borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4},children:[e.jsx(ce,{size:16}),e.jsx("span",{children:"继承/克隆"})]}),e.jsxs("button",{onClick:()=>g("/template-category"),style:{marginLeft:8,padding:"8px 14px",background:"#fff",color:"#0891b2",border:"1px solid #0891b2",borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4},children:[e.jsx(pe,{size:16}),e.jsx("span",{children:"分类树"})]})]}),e.jsxs("div",{style:t.toolbar,children:[e.jsxs("div",{style:t.searchBox,children:[e.jsx(xe,{size:18,style:{color:s.textLight}}),e.jsx("input",{type:"text",placeholder:"搜索模板名称、编码、内容...",value:d,onChange:a=>$(a.target.value),onKeyDown:a=>a.key==="Enter"&&Q(),style:t.searchInput})]}),e.jsxs("div",{style:t.filters,children:[e.jsxs("div",{style:t.filterGroup,children:[e.jsx(ge,{size:16,style:{color:s.textMid}}),e.jsxs("select",{value:y,onChange:a=>{H(a.target.value),u(1)},style:t.select,children:[e.jsx("option",{value:"all",children:"全部设备"}),e.jsx("option",{value:"CT",children:"CT"}),e.jsx("option",{value:"MRI",children:"MRI"}),e.jsx("option",{value:"X线",children:"X线"})]})]}),e.jsx("div",{style:t.filterGroup,children:e.jsxs("select",{value:m,onChange:a=>{N(a.target.value),u(1)},style:t.select,children:[e.jsx("option",{value:"all",children:"全部状态"}),e.jsx("option",{value:"active",children:"启用"}),e.jsx("option",{value:"inactive",children:"停用"})]})})]})]}),e.jsxs("div",{style:t.statsBar,children:[e.jsxs("div",{style:t.statItem,children:[e.jsx(X,{size:16,style:{color:s.primary}}),e.jsx("span",{style:t.statLabel,children:"模板总数"}),e.jsx("span",{style:t.statValue,children:n.length})]}),e.jsxs("div",{style:t.statItem,children:[e.jsx(w,{size:16,style:{color:s.accent}}),e.jsx("span",{style:t.statLabel,children:"CT模板"}),e.jsx("span",{style:t.statValue,children:n.filter(a=>a.modality==="CT").length})]}),e.jsxs("div",{style:t.statItem,children:[e.jsx(F,{size:16,style:{color:s.success}}),e.jsx("span",{style:t.statLabel,children:"MRI模板"}),e.jsx("span",{style:t.statValue,children:n.filter(a=>a.modality==="MRI").length})]}),e.jsxs("div",{style:t.statItem,children:[e.jsx(E,{size:16,style:{color:s.warning}}),e.jsx("span",{style:t.statLabel,children:"X线模板"}),e.jsx("span",{style:t.statValue,children:n.filter(a=>a.modality==="X线").length})]})]}),e.jsx("div",{style:t.tableWrapper,children:e.jsxs("table",{style:t.table,children:[e.jsx("thead",{children:e.jsxs("tr",{style:t.theadTr,children:[e.jsx("th",{style:{...t.th,...t.thCode},children:"模板编码"}),e.jsx("th",{style:{...t.th,...t.thName},children:"模板名称"}),e.jsx("th",{style:{...t.th,...t.thModality},children:"检查类型"}),e.jsx("th",{style:{...t.th,...t.thCategory},children:"分类"}),e.jsx("th",{style:{...t.th,...t.thTags},children:"标签"}),e.jsx("th",{style:{...t.th,...t.thUsage},children:"使用次数"}),e.jsx("th",{style:{...t.th,...t.thStatus},children:"状态"}),e.jsx("th",{style:{...t.th,...t.thActions},children:"操作"})]})}),e.jsxs("tbody",{children:[W.map((a,p)=>e.jsxs("tr",{style:{...t.tr,backgroundColor:p%2===0?s.white:s.bgLight},children:[e.jsx("td",{style:t.td,children:e.jsx("code",{style:t.code,children:a.code})}),e.jsx("td",{style:t.td,children:e.jsxs("div",{style:t.nameCell,children:[e.jsx("span",{style:t.name,children:a.name}),e.jsx("span",{style:t.version,children:a.version})]})}),e.jsx("td",{style:t.td,children:e.jsxs("div",{style:t.modalityCell,children:[oe(a.modality),e.jsx("span",{style:t.modalityText,children:a.modality})]})}),e.jsxs("td",{style:t.td,children:[e.jsx("span",{style:t.categoryText,children:a.category}),e.jsxs("span",{style:t.subCategoryText,children:[" / ",a.subCategory]})]}),e.jsx("td",{style:t.td,children:e.jsxs("div",{style:t.tagsCell,children:[a.tags.slice(0,3).map(f=>e.jsx("span",{style:t.tag,children:f},f)),a.tags.length>3&&e.jsxs("span",{style:t.tagMore,children:["+",a.tags.length-3]})]})}),e.jsx("td",{style:t.td,children:e.jsx("span",{style:t.usageCount,children:a.usageCount})}),e.jsx("td",{style:t.td,children:e.jsx("span",{style:{...t.statusBadge,backgroundColor:a.status==="active"?s.successLight:s.bgLight,color:a.status==="active"?s.success:s.textLight},children:a.status==="active"?"启用":"停用"})}),e.jsx("td",{style:t.td,children:e.jsxs("div",{style:t.actionsCell,children:[e.jsx("button",{style:t.actionBtn,onClick:()=>Z(a),title:"预览",children:e.jsx(V,{size:16})}),e.jsx("button",{style:t.actionBtn,onClick:()=>J(a),title:"编辑",children:e.jsx(ue,{size:16})}),e.jsx("button",{style:{...t.actionBtn,...t.actionBtnDanger},onClick:()=>te(a.id),title:"删除",children:e.jsx(he,{size:16})})]})})]},a.id)),W.length===0&&e.jsx("tr",{children:e.jsxs("td",{colSpan:8,style:t.emptyCell,children:[e.jsx(A,{size:48,style:{color:s.textLight}}),e.jsx("p",{style:t.emptyText,children:"未找到匹配的模板"})]})})]})]})}),h>1&&e.jsxs("div",{style:t.pagination,children:[e.jsx("button",{style:{...t.pageBtn,...c===1?t.pageBtnDisabled:{}},onClick:()=>u(a=>Math.max(1,a-1)),disabled:c===1,children:"上一页"}),e.jsxs("div",{style:t.pageInfo,children:["第 ",e.jsx("span",{style:t.pageCurrent,children:c})," / ",h," 页",e.jsx("span",{style:t.pageDivider,children:"|"}),"共 ",j.length," 条"]}),e.jsx("button",{style:{...t.pageBtn,...c===h?t.pageBtnDisabled:{}},onClick:()=>u(a=>Math.min(h,a+1)),disabled:c===h,children:"下一页"})]}),K&&e.jsx("div",{style:t.modalOverlay,onClick:()=>x(!1),children:e.jsxs("div",{style:t.modal,onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{style:t.modalHeader,children:[e.jsxs("div",{style:t.modalTitle,children:[e.jsx(ye,{size:22,style:{color:s.primary}}),e.jsx("h2",{children:M==="add"?"新增模板":"编辑模板"})]}),e.jsx("button",{style:t.modalClose,onClick:()=>x(!1),children:e.jsx(P,{size:20})})]}),e.jsxs("div",{style:t.modalBody,children:[e.jsxs("div",{style:t.formRow,children:[e.jsxs("div",{style:t.formGroup,children:[e.jsxs("label",{style:t.label,children:[e.jsx(G,{size:14})," 模板编码 ",e.jsx("span",{style:t.required,children:"*"})]}),e.jsx("input",{type:"text",value:o.code,onChange:a=>r({...o,code:a.target.value}),style:t.input,placeholder:"如：CT-BRAIN-001"})]}),e.jsxs("div",{style:t.formGroup,children:[e.jsxs("label",{style:t.label,children:[e.jsx(O,{size:14})," 模板名称 ",e.jsx("span",{style:t.required,children:"*"})]}),e.jsx("input",{type:"text",value:o.name,onChange:a=>r({...o,name:a.target.value}),style:t.input,placeholder:"如：颅脑CT平扫模板"})]})]}),e.jsxs("div",{style:t.formRow,children:[e.jsxs("div",{style:t.formGroup,children:[e.jsxs("label",{style:t.label,children:[e.jsx(w,{size:14})," 检查类型"]}),e.jsxs("select",{value:o.modality,onChange:a=>r({...o,modality:a.target.value}),style:t.select,children:[e.jsx("option",{value:"CT",children:"CT"}),e.jsx("option",{value:"MRI",children:"MRI"}),e.jsx("option",{value:"X线",children:"X线"})]})]}),e.jsxs("div",{style:t.formGroup,children:[e.jsxs("label",{style:t.label,children:[e.jsx(X,{size:14})," 版本号"]}),e.jsx("input",{type:"text",value:o.version,onChange:a=>r({...o,version:a.target.value}),style:t.input,placeholder:"如：v1.0"})]})]}),e.jsxs("div",{style:t.formRow,children:[e.jsxs("div",{style:t.formGroup,children:[e.jsx("label",{style:t.label,children:"一级分类"}),e.jsx("input",{type:"text",value:o.category,onChange:a=>r({...o,category:a.target.value}),style:t.input,placeholder:"如：颅脑、胸部、腹部"})]}),e.jsxs("div",{style:t.formGroup,children:[e.jsx("label",{style:t.label,children:"二级分类"}),e.jsx("input",{type:"text",value:o.subCategory,onChange:a=>r({...o,subCategory:a.target.value}),style:t.input,placeholder:"如：平扫、增强、CTA"})]})]}),e.jsxs("div",{style:t.formGroup,children:[e.jsxs("label",{style:t.label,children:[e.jsx(me,{size:14})," 模板内容 ",e.jsx("span",{style:t.required,children:"*"})]}),e.jsx("textarea",{value:o.content,onChange:a=>r({...o,content:a.target.value}),style:t.textarea,placeholder:"输入报告模板内容...",rows:10})]}),e.jsxs("div",{style:t.formGroup,children:[e.jsxs("label",{style:t.label,children:[e.jsx(G,{size:14})," 标签"]}),e.jsxs("div",{style:t.tagInput,children:[e.jsx("input",{type:"text",value:v,onChange:a=>C(a.target.value),onKeyDown:a=>a.key==="Enter"&&(a.preventDefault(),D()),style:t.tagInputField,placeholder:"输入标签后按回车添加"}),e.jsx("button",{style:t.tagAddBtn,onClick:D,children:"添加"})]}),e.jsx("div",{style:t.tagsList,children:o.tags?.map(a=>e.jsxs("span",{style:t.tagItem,children:[a,e.jsx("button",{style:t.tagRemove,onClick:()=>se(a),children:"×"})]},a))})]}),e.jsxs("div",{style:t.formGroup,children:[e.jsx("label",{style:t.label,children:"状态"}),e.jsxs("div",{style:t.radioGroup,children:[e.jsxs("label",{style:t.radioLabel,children:[e.jsx("input",{type:"radio",checked:o.status==="active",onChange:()=>r({...o,status:"active"})}),e.jsx("span",{style:t.radioText,children:"启用"})]}),e.jsxs("label",{style:t.radioLabel,children:[e.jsx("input",{type:"radio",checked:o.status==="inactive",onChange:()=>r({...o,status:"inactive"})}),e.jsx("span",{style:t.radioText,children:"停用"})]})]})]})]}),e.jsxs("div",{style:t.modalFooter,children:[e.jsx("button",{style:t.cancelBtn,onClick:()=>x(!1),children:"取消"}),e.jsxs("button",{style:t.saveBtn,onClick:ee,children:[e.jsx(be,{size:16}),"保存"]})]})]})}),U&&l&&e.jsx("div",{style:t.modalOverlay,onClick:()=>b(!1),children:e.jsxs("div",{style:t.previewModal,onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{style:t.modalHeader,children:[e.jsxs("div",{style:t.modalTitle,children:[e.jsx(V,{size:22,style:{color:s.primary}}),e.jsx("h2",{children:"模板预览"})]}),e.jsx("button",{style:t.modalClose,onClick:()=>b(!1),children:e.jsx(P,{size:20})})]}),e.jsxs("div",{style:t.previewMeta,children:[e.jsxs("div",{style:t.previewMetaItem,children:[e.jsx("span",{style:t.previewMetaLabel,children:"编码："}),e.jsx("code",{style:t.code,children:l.code})]}),e.jsxs("div",{style:t.previewMetaItem,children:[e.jsx("span",{style:t.previewMetaLabel,children:"名称："}),e.jsx("span",{children:l.name})]}),e.jsxs("div",{style:t.previewMetaItem,children:[e.jsx("span",{style:t.previewMetaLabel,children:"类型："}),e.jsx("span",{children:l.modality})]}),e.jsxs("div",{style:t.previewMetaItem,children:[e.jsx("span",{style:t.previewMetaLabel,children:"版本："}),e.jsx("span",{children:l.version})]}),e.jsxs("div",{style:t.previewMetaItem,children:[e.jsx("span",{style:t.previewMetaLabel,children:"分类："}),e.jsxs("span",{children:[l.category," / ",l.subCategory]})]}),e.jsxs("div",{style:t.previewMetaItem,children:[e.jsx("span",{style:t.previewMetaLabel,children:"作者："}),e.jsx("span",{children:l.author})]}),e.jsxs("div",{style:t.previewMetaItem,children:[e.jsx("span",{style:t.previewMetaLabel,children:"使用次数："}),e.jsx("span",{children:l.usageCount})]})]}),e.jsx("div",{style:t.previewContent,children:e.jsx("pre",{style:t.previewText,children:l.content})}),e.jsx("div",{style:t.previewTags,children:l.tags.map(a=>e.jsx("span",{style:t.tag,children:a},a))}),e.jsxs("div",{style:t.modalFooter,children:[e.jsxs("button",{style:t.copyBtn,onClick:()=>ae(l.content),children:[e.jsx(ve,{size:16}),"复制内容"]}),e.jsx("button",{style:t.cancelBtn,onClick:()=>b(!1),children:"关闭"})]})]})}),R&&e.jsxs("div",{style:{position:"fixed",top:24,right:24,zIndex:9999,background:"#059669",color:"#fff",padding:"12px 20px",borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.2)",fontSize:14,display:"flex",alignItems:"center",gap:8},children:[e.jsx(Ce,{size:16}),R]}),z&&e.jsx("div",{style:{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:"#dc2626",color:"#fff",padding:"12px 24px",borderRadius:8,boxShadow:"0 4px 12px rgba(220,38,38,0.3)",fontSize:14,fontWeight:500},children:z})]})}const t={container:{padding:"24px",backgroundColor:s.bg,minHeight:"100vh",fontFamily:'"Microsoft YaHei", "Segoe UI", sans-serif'},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",backgroundColor:s.white,padding:"16px 24px",borderRadius:"8px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},headerLeft:{display:"flex",alignItems:"center",gap:"12px"},title:{fontSize:"22px",fontWeight:600,color:s.textDark,margin:0},addBtn:{display:"flex",alignItems:"center",gap:"6px",padding:"10px 18px",backgroundColor:s.primary,color:s.white,border:"none",borderRadius:"6px",fontSize:"14px",fontWeight:500,cursor:"pointer",transition:"background-color 0.2s"},toolbar:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",gap:"16px",backgroundColor:s.white,padding:"16px 20px",borderRadius:"8px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},searchBox:{display:"flex",alignItems:"center",gap:"10px",flex:1,maxWidth:"400px",padding:"8px 14px",backgroundColor:s.bgLight,borderRadius:"6px",border:`1px solid ${s.borderLight}`},searchInput:{flex:1,border:"none",outline:"none",backgroundColor:"transparent",fontSize:"14px",color:s.textDark},filters:{display:"flex",alignItems:"center",gap:"12px"},filterGroup:{display:"flex",alignItems:"center",gap:"8px"},select:{padding:"8px 12px",border:`1px solid ${s.border}`,borderRadius:"6px",fontSize:"14px",color:s.textDark,backgroundColor:s.white,cursor:"pointer",outline:"none"},statsBar:{display:"flex",gap:"24px",marginBottom:"16px",backgroundColor:s.white,padding:"14px 24px",borderRadius:"8px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},statItem:{display:"flex",alignItems:"center",gap:"8px"},statLabel:{fontSize:"14px",color:s.textMid},statValue:{fontSize:"16px",fontWeight:600,color:s.textDark},tableWrapper:{backgroundColor:s.white,borderRadius:"8px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)",overflow:"hidden"},table:{width:"100%",borderCollapse:"collapse"},theadTr:{backgroundColor:s.primaryLighter},th:{padding:"12px 16px",textAlign:"left",fontSize:"13px",fontWeight:600,color:s.primary,borderBottom:`2px solid ${s.primaryLight}`},thCode:{width:"130px"},thName:{width:"180px"},thModality:{width:"90px"},thCategory:{width:"120px"},thTags:{width:"150px"},thUsage:{width:"80px"},thStatus:{width:"70px"},thActions:{width:"120px"},tr:{transition:"background-color 0.15s"},td:{padding:"12px 16px",fontSize:"13px",color:s.textDark,borderBottom:`1px solid ${s.borderLight}`},code:{fontFamily:'"Consolas", "Monaco", monospace',fontSize:"12px",backgroundColor:s.bgLight,padding:"2px 6px",borderRadius:"4px",color:s.primary},nameCell:{display:"flex",flexDirection:"column",gap:"2px"},name:{fontWeight:500},version:{fontSize:"11px",color:s.textLight},modalityCell:{display:"flex",alignItems:"center",gap:"6px"},modalityText:{fontWeight:500},categoryText:{fontWeight:500},subCategoryText:{color:s.textLight,fontSize:"12px"},tagsCell:{display:"flex",flexWrap:"wrap",gap:"4px"},tag:{display:"inline-block",padding:"2px 8px",backgroundColor:s.primaryLighter,color:s.primary,borderRadius:"10px",fontSize:"11px"},tagMore:{display:"inline-block",padding:"2px 6px",backgroundColor:s.bgLight,color:s.textLight,borderRadius:"10px",fontSize:"11px"},usageCount:{fontWeight:500,color:s.accent},statusBadge:{display:"inline-block",padding:"3px 10px",borderRadius:"12px",fontSize:"12px",fontWeight:500},actionsCell:{display:"flex",gap:"8px"},actionBtn:{display:"flex",alignItems:"center",justifyContent:"center",width:"30px",height:"30px",backgroundColor:s.bgLight,border:"none",borderRadius:"6px",cursor:"pointer",color:s.textMid,transition:"all 0.2s"},actionBtnDanger:{color:s.danger},emptyCell:{textAlign:"center",padding:"60px 20px",color:s.textLight},emptyText:{marginTop:"12px",fontSize:"14px"},pagination:{display:"flex",justifyContent:"center",alignItems:"center",gap:"20px",marginTop:"20px",padding:"14px",backgroundColor:s.white,borderRadius:"8px",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"},pageBtn:{padding:"8px 16px",backgroundColor:s.primary,color:s.white,border:"none",borderRadius:"6px",fontSize:"13px",cursor:"pointer"},pageBtnDisabled:{backgroundColor:s.borderLight,color:s.textLight,cursor:"not-allowed"},pageInfo:{fontSize:"13px",color:s.textMid},pageCurrent:{fontWeight:600,color:s.primary},pageDivider:{margin:"0 8px",color:s.border},modalOverlay:{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(0, 0, 0, 0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3},modal:{width:"700px",maxHeight:"90vh",backgroundColor:s.white,borderRadius:"12px",boxShadow:"0 4px 20px rgba(0, 0, 0, 0.15)",overflow:"hidden",display:"flex",flexDirection:"column"},previewModal:{width:"650px",maxHeight:"90vh",backgroundColor:s.white,borderRadius:"12px",boxShadow:"0 4px 20px rgba(0, 0, 0, 0.15)",overflow:"hidden",display:"flex",flexDirection:"column"},modalHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",borderBottom:`1px solid ${s.borderLight}`,backgroundColor:s.bgLight},modalTitle:{display:"flex",alignItems:"center",gap:"10px"},modalClose:{display:"flex",alignItems:"center",justifyContent:"center",width:"32px",height:"32px",backgroundColor:"transparent",border:"none",borderRadius:"6px",cursor:"pointer",color:s.textMid},modalBody:{padding:"20px 24px",overflowY:"auto",flex:1},formRow:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"},formGroup:{marginBottom:"16px"},label:{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:500,color:s.textDark,marginBottom:"6px"},required:{color:s.danger},input:{width:"100%",padding:"10px 12px",border:`1px solid ${s.border}`,borderRadius:"6px",fontSize:"14px",color:s.textDark,outline:"none",boxSizing:"border-box"},textarea:{width:"100%",padding:"10px 12px",border:`1px solid ${s.border}`,borderRadius:"6px",fontSize:"14px",color:s.textDark,outline:"none",fontFamily:'"Consolas", "Monaco", monospace',resize:"vertical",boxSizing:"border-box"},tagInput:{display:"flex",gap:"8px"},tagInputField:{flex:1,padding:"8px 12px",border:`1px solid ${s.border}`,borderRadius:"6px",fontSize:"14px",outline:"none"},tagAddBtn:{padding:"8px 16px",backgroundColor:s.primaryLighter,color:s.primary,border:"none",borderRadius:"6px",fontSize:"13px",cursor:"pointer"},tagsList:{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"10px"},tagItem:{display:"flex",alignItems:"center",gap:"4px",padding:"4px 10px",backgroundColor:s.primaryLighter,color:s.primary,borderRadius:"14px",fontSize:"13px"},tagRemove:{backgroundColor:"transparent",border:"none",color:s.primary,cursor:"pointer",fontSize:"16px",lineHeight:1,padding:0},radioGroup:{display:"flex",gap:"20px"},radioLabel:{display:"flex",alignItems:"center",gap:"6px",fontSize:"14px",color:s.textDark,cursor:"pointer"},radioText:{fontSize:"14px"},modalFooter:{display:"flex",justifyContent:"flex-end",gap:"12px",padding:"16px 24px",borderTop:`1px solid ${s.borderLight}`,backgroundColor:s.bgLight},cancelBtn:{padding:"10px 20px",backgroundColor:s.white,color:s.textMid,border:`1px solid ${s.border}`,borderRadius:"6px",fontSize:"14px",cursor:"pointer"},saveBtn:{display:"flex",alignItems:"center",gap:"6px",padding:"10px 20px",backgroundColor:s.primary,color:s.white,border:"none",borderRadius:"6px",fontSize:"14px",cursor:"pointer"},copyBtn:{display:"flex",alignItems:"center",gap:"6px",padding:"10px 20px",backgroundColor:s.accent,color:s.white,border:"none",borderRadius:"6px",fontSize:"14px",cursor:"pointer"},previewMeta:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"12px",padding:"16px 24px",backgroundColor:s.bgLight,borderBottom:`1px solid ${s.borderLight}`},previewMetaItem:{fontSize:"13px",color:s.textMid},previewMetaLabel:{fontWeight:500,color:s.textDark},previewContent:{padding:"20px 24px",flex:1,overflowY:"auto"},previewText:{fontFamily:'"Consolas", "Monaco", monospace',fontSize:"13px",lineHeight:1.8,color:s.textDark,whiteSpace:"pre-wrap",margin:0},previewTags:{display:"flex",flexWrap:"wrap",gap:"8px",padding:"12px 24px",borderTop:`1px solid ${s.borderLight}`}};export{ke as default};
