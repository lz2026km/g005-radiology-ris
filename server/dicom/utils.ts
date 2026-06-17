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
  '00080060': { group: 0x0008, element: 0x0060, vr: 'CS', name: 'Modality', keyword: 'Modality' },
  '00200011': { group: 0x0020, element: 0x0011, vr: 'IS', name: 'Series Number', keyword: 'SeriesNumber' },
  '00200013': { group: 0x0020, element: 0x0013, vr: 'IS', name: 'Instance Number', keyword: 'InstanceNumber' },
  '00080008': { group: 0x0008, element: 0x0008, vr: 'CS', name: 'Image Type', keyword: 'ImageType' },
  '00280030': { group: 0x0028, element: 0x0030, vr: 'DS', name: 'Pixel Spacing', keyword: 'PixelSpacing' },
  '00201209': { group: 0x0020, element: 0x1209, vr: 'IS', name: 'Number of Series', keyword: 'NumberOfSeries' },
  '00201208': { group: 0x0020, element: 0x1208, vr: 'IS', name: 'Number of Instances', keyword: 'NumberOfInstances' },
  '00200060': { group: 0x0020, element: 0x0060, vr: 'CS', name: 'Laterality', keyword: 'Laterality' },
  '00185101': { group: 0x0018, element: 0x5101, vr: 'CS', name: 'View Position', keyword: 'ViewPosition' },
  '00101010': { group: 0x0010, element: 0x1010, vr: 'AS', name: "Patient's Age", keyword: 'PatientAge' },
  '00101020': { group: 0x0010, element: 0x1020, vr: 'DS', name: "Patient's Size", keyword: 'PatientSize' },
  '00101030': { group: 0x0010, element: 0x1030, vr: 'DS', name: "Patient's Weight", keyword: 'PatientWeight' },
  '00180010': { group: 0x0018, element: 0x0010, vr: 'LO', name: 'Contrast/Bolus Agent', keyword: 'ContrastBolusAgent' },
  '00180060': { group: 0x0018, element: 0x0060, vr: 'DS', name: 'KVP', keyword: 'KVP' },
  '00181151': { group: 0x0018, element: 0x1151, vr: 'IS', name: 'X-Ray Tube Current', keyword: 'XRayTubeCurrent' },
  '00181150': { group: 0x0018, element: 0x1150, vr: 'IS', name: 'Exposure Time', keyword: 'ExposureTime' },
  '00181000': { group: 0x0018, element: 0x1000, vr: 'LO', name: 'Device Serial Number', keyword: 'DeviceSerialNumber' },
  '00181030': { group: 0x0018, element: 0x1030, vr: 'LO', name: 'Protocol Name', keyword: 'ProtocolName' },
  '00180022': { group: 0x0018, element: 0x0022, vr: 'CS', name: 'Scan Options', keyword: 'ScanOptions' },
  '00180050': { group: 0x0018, element: 0x0050, vr: 'DS', name: 'Slice Thickness', keyword: 'SliceThickness' },
  '00180088': { group: 0x0018, element: 0x0088, vr: 'DS', name: 'Spacing Between Slices', keyword: 'SpacingBetweenSlices' },
  '00080070': { group: 0x0008, element: 0x0070, vr: 'LO', name: 'Manufacturer', keyword: 'Manufacturer' },
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
