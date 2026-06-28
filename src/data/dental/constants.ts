// [v3.0.6.8-81] 口腔模块共享常量
export const MODALITY_LABELS: Record<string, string> = {
  'CBCT': 'CBCT (锥形束 CT)',
  'Panoramic': '全景片',
  'Periapical': '根尖片',
  'Bitewing': '咬合翼片',
  'Scan': '口扫 (3D)',
  'Photo': '口内照片',
};

export const MODALITY_COLORS: Record<string, string> = {
  'CBCT': 'purple',
  'Panoramic': 'blue',
  'Periapical': 'cyan',
  'Bitewing': 'geekblue',
  'Scan': 'magenta',
  'Photo': 'green',
};

export const TREATMENT_TYPES = [
  'Restorative', 'Endodontic', 'Periodontal',
  'Implant', 'Orthodontic', 'Extraction',
  'Surgery', 'Pediatric',
] as const;

export type TreatmentType = typeof TREATMENT_TYPES[number];

export const TREATMENT_COLORS: Record<string, string> = {
  'Restorative': 'green',
  'Endodontic': 'volcano',
  'Periodontal': 'orange',
  'Implant': 'purple',
  'Orthodontic': 'blue',
  'Extraction': 'red',
  'Surgery': 'magenta',
  'Pediatric': 'cyan',
};

// FDI 牙位编号 (恒牙 32 颗)
export const FDI_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const FDI_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const FDI_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
export const FDI_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

export const ALL_FDI_TEETH = [
  ...FDI_UPPER_RIGHT,
  ...FDI_UPPER_LEFT,
  ...FDI_LOWER_LEFT,
  ...FDI_LOWER_RIGHT,
];