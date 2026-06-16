# Module 7: Orthopedic & MSK Imaging — PLAN

## Sub-modules & files

### 7.1 Orthopedic Measurement Tools (30p) — `measurements.ts`
- Angle measurements: Cobb angle, femoral neck-shaft angle, Q-angle, hallux valgus
- Linear measurements: joint space width, bone length, cortical thickness, displacement
- Limb alignment: mechanical axis deviation, mPTA, LDTA, MAD
- Circle fitting: femoral head center/radius
- Key functions: `measureCobbAngle`, `measureJointSpaceWidth`, `measureLimbAlignment`, `fitCircleToFemoralHead`, `generateMeasurementReport`

### 7.2 Spine Imaging Analysis (25p) — `spine.ts`
- Disc assessment: Pfirrmann grade, herniation type/direction, Modic changes
- Spinal stenosis grading: canal diameter to grade mapping
- Spinal alignment: cervical/lumbar lordosis, thoracic kyphosis, sagittal balance, pelvic parameters
- Vertebra fracture: AO Spine classification, height loss, retropulsion, listhesis
- Key functions: `assessDisc`, `computeSpinalAlignment`, `classifyVertebraFracture`, `generateSpineReport`

### 7.3 Joint Imaging Analysis (25p) — `joint.ts`
- Osteoarthritis grading: Kellgren-Lawrence
- Cartilage: ICRS grade per region
- Meniscus: medial/lateral grading, extrusion
- Ligaments: intact/tear type/signal
- Joint-specific: labrum (hip), alpha angle, center-edge angle
- Key functions: `gradeOsteoarthritis`, `assessCartilageRegion`, `assessMeniscus`, `assessLigament`, `analyzeJoint`, `generateJointReport`

### 7.4 Trauma Imaging Analysis (25p) — `trauma.ts`
- Fracture: pattern, displacement, angulation, comminution, AO code
- Dislocation: joint, direction, completeness, associated fracture
- Soft tissue: muscle/tendon/ligament injury, hematoma
- Trauma scoring
- Key functions: `assessFracture`, `assessDislocation`, `assessSoftTissueInjury`, `computeTraumaScore`, `generateTraumaAssessment`

### 7.5 Bone Tumor Analysis (20p) — `tumor.ts`
- Tumor matrix/margin/periosteal reaction characterization
- Bone-RADS integration via `scoreBoneRads` from `data/rads/boneRads`
- Differential diagnosis suggestion
- Follow-up growth rate calculation
- Key functions: `assessBoneTumor`, `assessTumorFollowUp`, `generateBoneTumorAnalysis`

### 7.6 BMD & Osteoporosis (20p) — `bmd.ts`
- DXA measurement: T-score / Z-score calculation (simplified reference tables)
- Osteoporosis classification: normal / osteopenia / osteoporosis
- FRAX estimation: major osteoporotic + hip fracture probability (simplified risk model)
- Vertebral fracture assessment: Genant semiquantitative grading
- Key functions: `interpretDxa`, `classifyOsteoporosis`, `calculateFrax`, `assessVertebralFracture`, `generateBmdReport`

### 7.7 Sports Medicine (20p) — `sports.ts`
- ACL assessment: tear pattern, chronicity, graft evaluation
- Rotator cuff: tendon-specific, tear size, retraction, Goutallier fatty infiltration
- Cartilage mapping: ICRS, T2 mapping, T1rho, collagen integrity
- Return-to-play assessment: phase-based, strength/ROM deficits
- Key functions: `assessAcl`, `assessRotatorCuff`, `mapCartilage`, `assessReturnToPlay`, `generateSportsInjuryAssessment`

### 7.8 Orthopedic Structured Reports (35p) — `src/templates/ortho/index.ts`
- 9 structured report templates for: knee OA, spine degenerative, shoulder sports, hip BMD, trauma, hip OA, ankle sports, bone tumor, spine trauma
- Multi-anatomy, multi-modality (MR/CT/DR/DXA), multi-type (OA/fracture/tumor/bmd/sports)
- Validation, rendering with bilingual (zh-CN/en-US) support
- Functions: `getOrthoTemplates`, `getOrthoTemplatesByRegion`, `getOrthoTemplatesByType`, `renderOrthoReport`, `validateOrthoReportData`
