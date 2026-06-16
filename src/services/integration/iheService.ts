export async function registerDocument(document: any, repository: string): Promise<string> {
  await new Promise(r => setTimeout(r, 400));
  return `doc-${Date.now()}`;
}

export async function queryDocuments(patientId: string, domain: string): Promise<any[]> {
  await new Promise(r => setTimeout(r, 300));
  return [
    { documentId: 'doc-001', patientId, repositoryUniqueId: '1.2.3.4', classCode: 'RAD', formatCode: 'urn:ihe:rad:1', mimeType: 'application/dicom', size: 1024 },
    { documentId: 'doc-002', patientId, repositoryUniqueId: '1.2.3.5', classCode: 'RAD', formatCode: 'urn:ihe:rad:2', mimeType: 'application/pdf', size: 512 },
  ];
}

export async function retrieveDocument(docId: string, repository: string): Promise<any> {
  await new Promise(r => setTimeout(r, 300));
  return { docId, repository, data: new ArrayBuffer(1024), mimeType: 'application/dicom' };
}

export async function queryPDQ(patientId: string, assigningAuthority: string): Promise<any> {
  await new Promise(r => setTimeout(r, 300));
  return {
    id: patientId,
    assigningAuthority,
    name: '张三',
    birthDate: '1990-01-01',
    sex: 'M',
    address: '测试地址',
    phone: '13800138000',
  };
}

export async function crossReferencePatient(localId: string, remoteDomain: string): Promise<string> {
  await new Promise(r => setTimeout(r, 300));
  return `${remoteDomain}-${localId}`;
}
