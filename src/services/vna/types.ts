export type DicomTransferSyntax =
  | '1.2.840.10008.1.2'   // Implicit VR Little Endian
  | '1.2.840.10008.1.2.1' // Explicit VR Little Endian
  | '1.2.840.10008.1.2.2' // Explicit VR Big Endian
  | '1.2.840.10008.1.2.4.50'  // JPEG Baseline
  | '1.2.840.10008.1.2.4.51'  // JPEG Extended
  | '1.2.840.10008.1.2.4.57'  // JPEG Lossless
  | '1.2.840.10008.1.2.4.70'  // JPEG Lossless SV1
  | '1.2.840.10008.1.2.4.80'  // JPEG-LS Lossless
  | '1.2.840.10008.1.2.4.81'  // JPEG-LS Lossy
  | '1.2.840.10008.1.2.4.90'  // JPEG 2000 Lossless
  | '1.2.840.10008.1.2.4.91'  // JPEG 2000 Lossy
  | '1.2.840.10008.1.2.4.92'  // JPEG 2000 MC
  | '1.2.840.10008.1.2.4.93'  // JPEG 2000 MC Lossless
  | '1.2.840.10008.1.2.5'    // RLE Lossless
  | string;

export interface PresentationContext {
  abstractSyntax: string;
  transferSyntaxes: DicomTransferSyntax[];
  contextId: number;
  result?: number;
}

export interface AssociationRequest {
  calledAeTitle: string;
  callingAeTitle: string;
  maxPduLength: number;
  presentationContexts: PresentationContext[];
}

export interface DicomPatient {
  patientId: string;
  patientName: string;
  patientBirthDate?: string;
  patientSex?: 'M' | 'F' | 'O';
  issuerOfPatientId?: string;
  otherPatientIds?: string[];
  otherPatientNames?: string[];
  ethnicGroup?: string;
  patientComments?: string;
  numberOfPatientRelatedStudies?: number;
  numberOfPatientRelatedSeries?: number;
  numberOfPatientRelatedInstances?: number;
}

export interface DicomStudy {
  studyInstanceUid: string;
  patientId: string;
  patientName: string;
  studyId?: string;
  studyDate?: string;
  studyTime?: string;
  accessionNumber?: string;
  referringPhysicianName?: string;
  referringPhysicianId?: string;
  studyDescription?: string;
  procedureCodeSequence?: string;
  procedureDescription?: string;
  studyPriorityId?: string;
  numberOfStudyRelatedSeries?: number;
  numberOfStudyRelatedInstances?: number;
  modalitiesInStudy?: string[];
  institutionName?: string;
  institutionAddress?: string;
  stationName?: string;
  departmentName?: string;
  bodyPartExamined?: string;
  manufacturer?: string;
  deviceSerialNumber?: string;
  softwareVersions?: string;
  timezoneOffsetFromUtc?: string;
  status: 'created' | 'in_progress' | 'completed' | 'verified' | 'archived' | 'deleted';
  storageTier: 'hot' | 'cool' | 'cold' | 'glacier';
  retentionDate?: string;
  createdAt: string;
  updatedAt: string;
  sizeInBytes?: number;
  instanceCount?: number;
  seriesCount?: number;
}

export interface DicomSeries {
  seriesInstanceUid: string;
  studyInstanceUid: string;
  seriesNumber?: number;
  seriesDate?: string;
  seriesTime?: string;
  seriesDescription?: string;
  modality: string;
  manufacturer?: string;
  manufacturerModelName?: string;
  deviceSerialNumber?: string;
  softwareVersions?: string;
  protocolName?: string;
  sequenceName?: string;
  seriesType?: string[];
  bodyPartExamined?: string;
  patientPosition?: string;
  laterality?: string;
  numberOfSeriesRelatedInstances?: number;
  numberOfTemporalPositions?: number;
  numberOfSlices?: number;
  rows?: number;
  columns?: number;
  pixelSpacing?: [number, number];
  sliceThickness?: number;
  spacingBetweenSlices?: number;
  contrastBolusAgent?: string;
  performingPhysicianName?: string;
  operatorName?: string;
  seriesStatus: 'created' | 'completed' | 'deleted';
  storageTier: 'hot' | 'cool' | 'cold' | 'glacier';
  sizeInBytes?: number;
  instanceCount?: number;
}

export interface DicomInstance {
  sopInstanceUid: string;
  seriesInstanceUid: string;
  studyInstanceUid: string;
  sopClassUid: string;
  instanceNumber?: number;
  contentDate?: string;
  contentTime?: string;
  acquisitionDate?: string;
  acquisitionTime?: string;
  acquisitionNumber?: number;
  imageType?: string[];
  pixelData?: Uint8Array;
  numberOfFrames?: number;
  frameTime?: number;
  rows?: number;
  columns?: number;
  bitsAllocated?: number;
  bitsStored?: number;
  highBit?: number;
  pixelRepresentation?: number;
  planarConfiguration?: number;
  photometricInterpretation?: string;
  samplesPerPixel?: number;
  transferSyntaxUid: DicomTransferSyntax;
  lossyImageCompression?: string;
  lossyImageCompressionRatio?: number[];
  lossyImageCompressionMethod?: string;
  iconImageSize?: [number, number];
  presentationLutShape?: string;
  windowCenter?: number | number[];
  windowWidth?: number | number[];
  rescaleIntercept?: number;
  rescaleSlope?: number;
  sizeInBytes?: number;
  hash?: string;
  storagePath?: string;
  storageTier: 'hot' | 'cool' | 'cold' | 'glacier';
  status: 'created' | 'archived' | 'deleted';
}

export interface VnaStoreRequest {
  study: DicomStudy;
  series: DicomSeries;
  instances: DicomInstance[];
}

export interface VnaQueryParams {
  patientId?: string;
  patientName?: string;
  studyInstanceUid?: string;
  seriesInstanceUid?: string;
  accessionNumber?: string;
  modality?: string;
  studyDateFrom?: string;
  studyDateTo?: string;
  studyDescription?: string;
  referringPhysician?: string;
  institutionName?: string;
  bodyPart?: string;
  status?: string;
  storageTier?: string;
  limit?: number;
  offset?: number;
}

export interface VnaQueryResult {
  studies: DicomStudy[];
  total: number;
  limit: number;
  offset: number;
}

export interface AETitle {
  name: string;
  aeTitle: string;
  hostname: string;
  port: number;
  modality?: string;
  institution?: string;
  department?: string;
  status: 'online' | 'offline' | 'unknown';
  lastSeen?: string;
  allowedStudies?: boolean;
  allowedQuery?: boolean;
  allowedRetrieve?: boolean;
  allowedStore?: boolean;
  maxConnections?: number;
}

export interface VnaRoutingRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: VnaRoutingCondition[];
  action: 'store' | 'forward' | 'replicate' | 'archive';
  targetAeTitle?: string;
  targetUrl?: string;
  targetStorageTier?: string;
  priority: number;
}

export interface VnaRoutingCondition {
  field: 'modality' | 'institution' | 'bodyPart' | 'studyDescription' | 'patientId';
  operator: 'equals' | 'contains' | 'startsWith' | 'regex' | 'in';
  value: string | string[];
}

export interface AnonymizationRule {
  tag: string;
  action: 'replace' | 'remove' | 'keep' | 'hash' | 'dateShift';
  replaceWith?: string;
  dateShiftDays?: number;
  hashSalt?: string;
}

export interface VnaHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  studiesCount: number;
  seriesCount: number;
  instancesCount: number;
  totalSizeBytes: number;
  storageTierDistribution: Record<string, number>;
  modalitiesCount: Record<string, number>;
  activeAssociations: number;
  lastError?: string;
  lastErrorTime?: string;
  version: string;
}

export interface VnaMetrics {
  studiesAdded: number;
  studiesQueried: number;
  studiesRetrieved: number;
  instancesStored: number;
  instancesRetrieved: number;
  storageBytesWritten: number;
  storageBytesRead: number;
  averageStoreTimeMs: number;
  averageQueryTimeMs: number;
  averageRetrieveTimeMs: number;
  errorCount: number;
  activeScpConnections: number;
  activeScuConnections: number;
  timestamp: string;
}
