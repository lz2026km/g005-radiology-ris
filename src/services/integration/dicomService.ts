export interface AETitle {
  name: string;
  title: string;
  ip: string;
  port: number;
  enabled: boolean;
}

export async function testCEcho(ae: AETitle): Promise<boolean> {
  await new Promise(r => setTimeout(r, 500));
  return true;
}

export async function queryMWL(ae: AETitle, filters: Record<string, string>): Promise<any[]> {
  await new Promise(r => setTimeout(r, 300));
  return [
    {
      accessionNumber: 'ACC-001',
      patientName: '张三',
      patientId: 'P001',
      modality: 'CT',
      scheduledDate: '2026-06-15',
      scheduledTime: '09:00',
      procedureStepId: 'SPS-001',
    },
    {
      accessionNumber: 'ACC-002',
      patientName: '李四',
      patientId: 'P002',
      modality: 'MR',
      scheduledDate: '2026-06-15',
      scheduledTime: '10:00',
      procedureStepId: 'SPS-002',
    },
  ];
}

export async function updateMPPS(ae: AETitle, status: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 200));
  return true;
}

export async function storeSCP(ae: AETitle, instances: any[]): Promise<string[]> {
  await new Promise(r => setTimeout(r, 400));
  return instances.map((_, i) => `1.2.840.10008.5.1.4.1.1.2.${i}.${Date.now()}`);
}
