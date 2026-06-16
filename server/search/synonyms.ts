export interface SynonymGroup {
  word: string;
  synonyms: string[];
  language: 'zh' | 'en';
  category: string;
}

const synonymGroups: SynonymGroup[] = [
  { word: 'CT', synonyms: ['computed tomography', 'CAT scan', 'computer tomography', 'CT scan'], language: 'en', category: 'modality' },
  { word: 'MRI', synonyms: ['MR', 'magnetic resonance', 'NMR', 'magnetic resonance imaging'], language: 'en', category: 'modality' },
  { word: 'X-ray', synonyms: ['XR', 'radiography', 'plain film', 'DR', 'digital radiography'], language: 'en', category: 'modality' },
  { word: '超声', synonyms: ['超声波', 'B超', '彩超', 'US', 'ultrasound'], language: 'zh', category: 'modality' },
  { word: 'CT', synonyms: ['计算机断层扫描', 'CT扫描'], language: 'zh', category: 'modality' },
  { word: '核磁', synonyms: ['磁共振', 'MRI', 'MR', '核磁共振'], language: 'zh', category: 'modality' },
  { word: 'X光', synonyms: ['X射线', 'DR', '胸片', '平片', '放射'], language: 'zh', category: 'modality' },
];

export const synonymService = {
  async expand(query: string): Promise<string[]> {
    const expanded = new Set<string>([query]);
    for (const group of synonymGroups) {
      if (group.word === query || group.synonyms.includes(query)) {
        group.synonyms.forEach(s => expanded.add(s));
        expanded.add(group.word);
      }
    }
    return Array.from(expanded);
  },

  async expandQuery(text: string): Promise<string> {
    const words = text.split(/\s+/);
    const expandedParts = await Promise.all(words.map(w => this.expand(w)));
    const allTerms = new Set<string>();
    for (const parts of expandedParts) {
      parts.forEach(p => allTerms.add(p));
    }
    return Array.from(allTerms).join(' ');
  },

  addSynonymGroup(group: SynonymGroup): void {
    synonymGroups.push(group);
  },

  removeSynonymGroup(word: string): boolean {
    const idx = synonymGroups.findIndex(g => g.word === word);
    if (idx < 0) return false;
    synonymGroups.splice(idx, 1);
    return true;
  },

  getAllGroups(): SynonymGroup[] {
    return [...synonymGroups];
  },
};
