import type {
  DicomStudy,
  DicomSeries,
  DicomInstance,
  VnaQueryParams,
  VnaQueryResult,
} from "./types";

interface QueryLevel {
  level: "PATIENT" | "STUDY" | "SERIES" | "IMAGE";
  queryFields: string[];
  returnFields: string[];
}

const QUERY_LEVELS: Record<string, QueryLevel> = {
  PATIENT: {
    level: "PATIENT",
    queryFields: ["patientId", "patientName", "patientBirthDate", "patientSex"],
    returnFields: [
      "patientId",
      "patientName",
      "patientBirthDate",
      "patientSex",
      "numberOfPatientRelatedStudies",
    ],
  },
  STUDY: {
    level: "STUDY",
    queryFields: [
      "patientId",
      "patientName",
      "studyInstanceUid",
      "accessionNumber",
      "modality",
      "studyDate",
      "studyDescription",
      "referringPhysicianName",
      "institutionName",
      "bodyPartExamined",
    ],
    returnFields: [
      "studyInstanceUid",
      "patientId",
      "patientName",
      "studyId",
      "studyDate",
      "studyTime",
      "accessionNumber",
      "studyDescription",
      "modalitiesInStudy",
      "numberOfStudyRelatedSeries",
      "numberOfStudyRelatedInstances",
      "status",
      "storageTier",
    ],
  },
  SERIES: {
    level: "SERIES",
    queryFields: [
      "studyInstanceUid",
      "seriesInstanceUid",
      "modality",
      "seriesNumber",
      "seriesDescription",
      "protocolName",
    ],
    returnFields: [
      "seriesInstanceUid",
      "studyInstanceUid",
      "seriesNumber",
      "seriesDate",
      "seriesDescription",
      "modality",
      "protocolName",
      "numberOfSeriesRelatedInstances",
      "rows",
      "columns",
      "seriesStatus",
    ],
  },
  IMAGE: {
    level: "IMAGE",
    queryFields: [
      "studyInstanceUid",
      "seriesInstanceUid",
      "sopInstanceUid",
      "instanceNumber",
    ],
    returnFields: [
      "sopInstanceUid",
      "seriesInstanceUid",
      "studyInstanceUid",
      "sopClassUid",
      "instanceNumber",
      "rows",
      "columns",
      "bitsAllocated",
      "transferSyntaxUid",
      "sizeInBytes",
    ],
  },
};

export async function dicomQuery(
  level: string,
  params: VnaQueryParams,
): Promise<VnaQueryResult> {
  const queryLevel = QUERY_LEVELS[level] || QUERY_LEVELS.STUDY;

  const { vnaStore } = await import("./store");
  const result = await vnaStore.query(params);
  return result;
}

export async function dicomRetrieve(
  studyUid: string,
  seriesUid?: string,
  instanceUid?: string,
): Promise<{ instances: DicomInstance[] }> {
  const { vnaStore } = await import("./store");
  if (instanceUid && seriesUid) {
    const instances = await vnaStore.getInstances(studyUid, seriesUid);
    return {
      instances: instances.filter((i) => i.sopInstanceUid === instanceUid),
    };
  }
  if (seriesUid) {
    const instances = await vnaStore.getInstances(studyUid, seriesUid);
    return { instances };
  }
  const data = await vnaStore.getStudyData(studyUid);
  if (!data) return { instances: [] };
  const allInstances: DicomInstance[] = [];
  for (const s of Object.values(data.series)) {
    allInstances.push(...s.instances);
  }
  return { instances: allInstances };
}

export async function dicomMove(
  studyUid: string,
  destinationAe: string,
): Promise<{ success: boolean; message: string }> {
  return {
    success: true,
    message: `C-MOVE initiated for study ${studyUid} to ${destinationAe}`,
  };
}
