import json, re, os

# Missing nav keys and their Chinese/English translations
missing_entries = {
    'adverseEvents': ('不良事件', 'Adverse Events'),
    'adverseReactions': ('对比剂不良反应', 'Adverse Reactions'),
    'aiQc': ('AI 质控', 'AI QC'),
    'businessContinuity': ('业务连续性', 'Business Continuity'),
    'cdsManagement': ('CDS 管理', 'CDS Management'),
    'cdsStatistics': ('CDS 统计', 'CDS Statistics'),
    'cloudStorage': ('云存储', 'Cloud Storage'),
    'contrastInventory': ('对比剂库存', 'Contrast Inventory'),
    'contrastQualityCompliance': ('对比剂质量合规', 'Contrast Quality Compliance'),
    'cqi': ('持续质量改进', 'CQI'),
    'cvDatabase': ('心血管数据库', 'CV Database'),
    'cvOperations': ('心血管运营', 'CV Operations'),
    'cvQc': ('心血管质控', 'CV QC'),
    'cvRule': ('危急值规则', 'CV Rule'),
    'cvStats': ('危急值统计', 'CV Stats'),
    'dataDictionary': ('数据字典', 'Data Dictionary'),
    'defectLibrary': ('缺陷库', 'Defect Library'),
    'departmentFinance': ('科室财务', 'Department Finance'),
    'departmentQuality': ('科室质量', 'Department Quality'),
    'deviceOps': ('设备运维', 'Device Ops'),
    'doctorMobileWorkstation': ('医生移动工作站', 'Doctor Mobile'),
    'enterpriseSearch': ('企业搜索', 'Enterprise Search'),
    'greenIt': ('绿色 IT', 'Green IT'),
    'hrOperations': ('人事运营', 'HR Operations'),
    'injectionWorkstation': ('注射工作站', 'Injection Workstation'),
    'kioskCheckIn': ('自助报到', 'Kiosk Check-In'),
    'materialsManage': ('物资管理', 'Materials Management'),
    'medicalAlliance': ('医联体', 'Medical Alliance'),
    'multiSiteDashboard': ('多站点看板', 'Multi-Site Dashboard'),
    'nurseMobileWorkstation': ('护士移动工作站', 'Nurse Mobile'),
    'opsDashboard': ('运营看板', 'Ops Dashboard'),
    'patientEducation': ('患者教育', 'Patient Education'),
    'patientFinance': ('患者财务', 'Patient Finance'),
    'patientMobileApp': ('患者移动端', 'Patient Mobile App'),
    'patientSafetyGoals': ('患者安全目标', 'Patient Safety Goals'),
    'radiationSafety': ('辐射安全', 'Radiation Safety'),
    'rcaAnalysis': ('根因分析', 'RCA Analysis'),
    'reportGlossary': ('报告术语库', 'Report Glossary'),
    'riskManagement': ('风险管理', 'Risk Management'),
    'scoreRule': ('评分规则', 'Score Rule'),
    'selfServicePortal': ('自助服务', 'Self-Service Portal'),
    'serviceManagement': ('服务管理', 'Service Management'),
    'techMobileWorkstation': ('技师移动工作站', 'Tech Mobile'),
    'typicalFindings': ('常见征象库', 'Typical Findings'),
    'userManagement': ('用户管理', 'User Management'),
    'vnaDashboard': ('VNA 看板', 'VNA Dashboard'),
}

# Read existing nav.json files
for lng, locale_key in [('zh-CN', 'zh_CN'), ('en-US', 'en_US')]:
    nav_file = f'src/i18n/locales/{lng}/nav.json'
    
    with open(nav_file, 'r', encoding='utf-8') as f:
        nav = json.load(f)
    
    # Add missing entries
    for key, (zh_val, en_val) in missing_entries.items():
        val = zh_val if lng == 'zh-CN' else en_val
        if key not in nav:
            nav[key] = val
            print(f'  Added {lng}/nav.{key}: {val}')
        else:
            print(f'  Already exists {lng}/nav.{key}')
    
    with open(nav_file, 'w', encoding='utf-8') as f:
        json.dump(nav, f, ensure_ascii=False, indent=2)
    
    print(f'\n{lng}/nav.json now has {len(nav)} keys (was {len(nav) - len([k for k in missing_entries if k not in nav])})')
