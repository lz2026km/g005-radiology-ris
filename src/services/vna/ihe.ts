export type IheProfile = 'SWF' | 'PIR' | 'CPI' | 'PDI' | 'XDS-I' | 'TCE' | 'IDR';

export interface IheProfileConfig {
  profile: IheProfile;
  enabled: boolean;
  actors: string[];
  transactions: string[];
}

const SUPPORTED_PROFILES: Record<IheProfile, IheProfileConfig> = {
  SWF: { profile: 'SWF', enabled: true, actors: ['Department System Scheduler/Order Filler', 'Image Manager', 'Image Archive', 'Acquisition Modality'], transactions: ['Scheduled Procedure Step', 'Modality Worklist', 'Storage Commitment', 'PPS Manager'] },
  PIR: { profile: 'PIR', enabled: true, actors: ['Image Manager', 'Image Archive', 'Report Repository', 'Report Creator', 'Report Reader'], transactions: ['Query Images', 'Retrieve Images', 'Query Reports', 'Retrieve Reports'] },
  CPI: { profile: 'CPI', enabled: true, actors: ['Order Placer', 'Department System Scheduler/Order Filler'], transactions: ['Placer Order Management', 'Procedure Scheduled'], },
  PDI: { profile: 'PDI', enabled: true, actors: ['Portable Media Creator', 'Portable Media Importer'], transactions: ['Export to Media', 'Import from Media'] },
  'XDS-I': { profile: 'XDS-I', enabled: false, actors: ['Document Source', 'Document Consumer', 'Repository', 'Registry'], transactions: ['Provide & Register', 'Query', 'Retrieve'] },
  TCE: { profile: 'TCE', enabled: false, actors: ['Evidence Creator', 'Evidence Document Source', 'Evidence Document Consumer'], transactions: ['Create Evidence', 'Store Evidence', 'Retrieve Evidence'] },
  IDR: { profile: 'IDR', enabled: true, actors: ['Image Document Source', 'Image Document Consumer', 'Image Document Repository'], transactions: ['Query', 'Retrieve', 'Submit'] },
};

export function getSupportedProfiles(): IheProfileConfig[] {
  return Object.values(SUPPORTED_PROFILES).filter(p => p.enabled);
}

export function enableProfile(profile: IheProfile): void {
  if (SUPPORTED_PROFILES[profile]) SUPPORTED_PROFILES[profile].enabled = true;
}

export function disableProfile(profile: IheProfile): void {
  if (SUPPORTED_PROFILES[profile]) SUPPORTED_PROFILES[profile].enabled = false;
}

export function getProfileConfig(profile: IheProfile): IheProfileConfig | undefined {
  return SUPPORTED_PROFILES[profile];
}
