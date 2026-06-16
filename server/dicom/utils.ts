export interface DICOMTag {
  group: number;
  element: number;
  vr: string;
  name: string;
  keyword: string;
}

export const KNOWN_TAGS: Record<string, DICOMTag> = {
  '0020000D': { group: 0x0020, element: 0x000D, vr: 'UI', name: 'Study Instance UID', keyword: 'StudyInstanceUID' },
  '0020000E': { group: 0x0020, element: 0x000E, vr: 'UI', name: 'Series Instance UID', keyword: 'SeriesInstanceUID' },
  '00080018': { group: 0x0008, element: 0x0018, vr: 'UI', name: 'SOP Instance UID', keyword: 'SOPInstanceUID' },
  '00080016': { group: 0x0008, element: 0x0016, vr: 'UI', name: 'SOP Class UID', keyword: 'SOPClassUID' },
  '00080020': { group: 0x0008, element: 0x0020, vr: 'DA', name: 'Study Date', keyword: 'StudyDate' },
  '00080030': { group: 0x0008, element: 0x0030, vr: 'TM', name: 'Study Time', keyword: 'StudyTime' },
  '00080050': { group: 0x0008, element: 0x0050, vr: 'SH', name: 'Accession Number', keyword: 'AccessionNumber' },
  '00081030': { group: 0x0008, element: 0x1030, vr: 'LO', name: 'Study Description', keyword: 'StudyDescription' },
  '0008103E': { group: 0x0008, element: 0x103E, vr: 'LO', name: 'Series Description', keyword: 'SeriesDescription' },
  '00100010': { group: 0x0010, element: 0x0010, vr: 'PN', name: "Patient's Name", keyword: 'PatientName' },
  '00100020': { group: 0x0010, element: 0x0020, vr: 'LO', name: 'Patient ID', keyword: 'PatientID' },
  '00100030': { group: 0x0010, element: 0x0030, vr: 'DA', name: "Patient's Birth Date", keyword: 'PatientBirthDate' },
  '00100040': { group: 0x0010, element: 0x0040, vr: 'CS', name: "Patient's Sex", keyword: 'PatientSex' },
};

export function getTagName(tag: string): string {
  return KNOWN_TAGS[tag]?.name ?? `Unknown (${tag})`;
}

export function formatDICOMDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

export function formatDICOMTime(date: Date): string {
  return date.toISOString().slice(11, 23).replace(/:/g, '');
}
