/** 批量修复 lucide-react import - 最简版 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const root = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src';

// 完整 lucide-react 图标列表 (按字母序)
const LUCIDE_ICONS = [
  'Activity','AlertCircle','AlertOctagon','AlertTriangle','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
  'Award','BarChart','BarChart2','BarChart3','BarChart4','Bell','BookOpen','Bookmark','BookmarkCheck',
  'Brain','Camera','Calendar','CalendarCheck','CalendarClock','CalendarDays','CalendarRange','CalendarX',
  'Check','CheckCheck','CheckCircle','CheckSquare','ChevronDown','ChevronLeft','ChevronRight','ChevronUp',
  'Circle','Clipboard','ClipboardCheck','ClipboardList','Clock','Clock3','Cpu','CreditCard','Database',
  'Download','Droplet','Edit','Edit2','Edit3','Equal','ExternalLink','Eye','EyeOff',
  'File','FileCheck','FileCode','FileEdit','FileImage','FilePlus','FileSearch','FileSpreadsheet','FileStack',
  'FileText','FileType','Filter','FilterX','Fingerprint','Flag','Flame','Focus','Folder','FolderTree',
  'Gauge','GitBranch','GitFork','GitMerge','Globe','GraduationCap','Grid','Grid3x3','Hash',
  'Headphones','Heart','HelpCircle','History','Home','Image','Inbox','Info','Key',
  'Layout','LayoutDashboard','Leaf','Lightbulb','Link','Link2','List','ListChecks','ListOrdered','ListTree',
  'Loader','Loader2','Lock','LogIn','LogOut','Magnet','Map','MapPin','Maximize','Maximize2','Medal',
  'Menu','MessageCircle','MessageSquare','Mic','MicOff','Microscope','Minimize','Minus','MinusCircle',
  'Monitor','MonitorSmartphone','Moon','MoreHorizontal','MoreVertical','MousePointer','Move','Navigation',
  'Network','Package','Paintbrush','Palette','Pause','PauseCircle','Percent','Phone','PieChart','Pill',
  'Play','PlayCircle','Plus','PlusCircle','PlusSquare','Power','Printer','QrCode','Radar','Radio',
  'RefreshCw','Repeat','RotateCcw','Ruler','Save','Scan','ScanFace','Scroll','ScrollText','Search',
  'Send','Server','Settings','Share2','Shield','ShieldAlert','ShieldCheck',
  'Sigma','Sliders','Smartphone','Smile','SortAsc','SortDesc','Sparkles','Speaker',
  'Spline','Sprout','Square','Stamp','Star','Stethoscope','StopCircle','Sun','Sunrise','Sunset',
  'Syringe','Table','Table2','Tag','Target','Terminal','Thermometer','ThumbsDown','ThumbsUp','Timer',
  'Tool','Trash','Trash2','TrendingDown','TrendingUp','Triangle','Trophy',
  'Type','Upload','User','UserCheck','UserCircle','UserMinus','UserPlus','UserX',
  'Users','UsersRound','Video','Volume','Volume1','Volume2','VolumeX','Wallet','Wand2','Watch',
  'Wifi','WifiOff','Wind','Wrench','X','XCircle','XSquare','Zap','ZoomIn','ZoomOut',
  'Box','SquareIcon','DollarSign','HelpingHand','Layers','Layers3','Scissors','ScreenShare','ShieldOff',
];

/** Check if a name is a lucide-react icon (not HTML tag, not antd component) */
const ANT_DESIGN = ['AutoComplete','Button','Card','Checkbox','Col','Collapse','DatePicker','Dropdown','Form','Input','InputNumber','Layout','Menu','Modal','Pagination','Popconfirm','Popover','Progress','Radio','Row','Select','Slider','Spin','Statistic','Steps','Switch','Table','Tabs','Tag','Timeline','Tooltip','Transfer','Tree','TreeSelect','Typography','Upload','Badge','Alert','Descriptions','Drawer','Empty','ConfigProvider','Breadcrumb','Anchor','BackTop','Affix','Calendar','Carousel','Avatar','Result','Comment','List','Skeleton','Rate','Notification','Image','PageHeader','Cascader','Mentions','TimePicker','Segmented','CollapsePanel','FormItem','Slider','Space',]; const HTML = ['A','Abbr','Address','Area','Article','Aside','Audio','B','Base','Bdi','Bdo','Blockquote','Br','Button','Canvas','Caption','Cite','Code','Col','Colgroup','Data','Datalist','Dd','Del','Details','Dfn','Dialog','Div','Dl','Dt','Em','Embed','Fieldset','Figcaption','Figure','Footer','Form','H1','H2','H3','H4','H5','H6','Head','Header','Hgroup','Hr','Html','I','Iframe','Img','Input','Ins','Kbd','Label','Legend','Li','Link','Main','Map','Mark','Menu','Meta','Meter','Nav','Noscript','Object','Ol','Optgroup','Option','Output','P','Picture','Pre','Progress','Q','Rp','Rt','Ruby','S','Samp','Script','Search','Section','Select','Slot','Small','Source','Span','Strong','Style','Sub','Summary','Sup','Table','Tbody','Td','Template','Textarea','Tfoot','Th','Thead','Time','Title','Tr','Track','U','Ul','Var','Video','Wbr'];

const NOT_LUCIDE = new Set([...ANT_DESIGN, ...HTML, 'React', 'Lazy', 'Suspense', 'Fragment', 'StrictMode', 'Profiler', 'createElement', 'Sider', 'Header', 'Footer', 'Content', 'Navigate', 'Route', 'Routes', 'Link', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useContext', 'useReducer', 'useLayoutEffect', 'useImperativeHandle', 'useDebugValue', 'useTransition', 'useDeferredValue', 'createContext', 'forwardRef', 'memo', 'startTransition', 'lazy', 'createRef', 'cloneElement', 'Children', 'PureComponent', 'Component', 'createPortal', 'findDOMNode', 'unmountComponentAtNode', 'render', 'hydrate', 'createRoot', 'hydrateRoot', 'useNavigate', 'useLocation', 'useParams', 'useSearchParams', 'useRoutes', 'useMatch', 'createBrowserRouter', 'createHashRouter', 'RouterProvider', 'Outlet', 'useTranslation', 'withTranslation', 'Trans', 't', 'i18n', 'I18nextProvider', 'initReactI18next', 'LineChart','AreaChart','BarChart','PieChart','RadarChart','RadialBarChart','ComposedChart','ScatterChart','Line','Area','Bar','Pie','Cell','XAxis','YAxis','ZAxis','CartesianGrid','Tooltip','Legend','ResponsiveContainer','PolarGrid','PolarAngleAxis','PolarRadiusAxis','Radar','RadialBar','Funnel','FunnelChart','Treemap','Sankey','SunburstChart','ParallelCoordinates','Label','LabelList','ErrorBoundary','PermissionGate','Router',
]);

const LUCIDE_SET = new Set(LUCIDE_ICONS);

function fixFile(fp) {
  try {
    let content = readFileSync(fp, 'utf-8');
    if (!content.includes('lucide-react')) return [];

    const lines = content.split('\n');
    const importIdx = lines.findIndex(l => l.includes('lucide-react'));
    if (importIdx === -1) return [];

    // Find the full import: from the line BEFORE 'lucide-react' to the line WITH 'lucide-react'
    let startIdx = importIdx;
    while (startIdx > 0 && !lines[startIdx].includes('import')) {
      startIdx--;
    }
    // Find the '{' starting position
    const importLines = lines.slice(startIdx, importIdx + 1).join('\n');
    
    // Parse current imports from the full import block
    const braceMatch = importLines.match(/\{([\s\S]*?)\}/);
    if (!braceMatch) return [];
    const currentImports = braceMatch[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/g, '').replace(/\s+/g, '')).filter(Boolean);

    // Find used icons
    const usedIcons = [];
    for (const icon of LUCIDE_ICONS) {
      if (currentImports.includes(icon)) continue;
      if (NOT_LUCIDE.has(icon)) continue;
      const regex = new RegExp(`<${icon}(?=[\\s>])|\\bicon\\s*[:=]\\s*${icon}\\b|\\bas\\s*:\\s*${icon}\\b`);
      if (regex.test(content)) {
        const typeRegex = new RegExp(`:\\s*typeof\\s+${icon}\\b`);
        if (typeRegex.test(content)) continue;
        usedIcons.push(icon);
      }
    }

    if (usedIcons.length === 0) return [];

    // Rebuild import
    const all = [...currentImports, ...usedIcons];
    const unique = [...new Set(all)];
    const sorted = unique.sort((a, b) => a.localeCompare(b));
    const itemsPerLine = 6;
    const grouped = [];
    for (let i = 0; i < sorted.length; i += itemsPerLine) {
      grouped.push(sorted.slice(i, i + itemsPerLine).join(', '));
    }
    const newImportBlock = `import {\n  ${grouped.join(',\n  ')},\n} from "lucide-react";`;

    // Replace the old import block
    const startContent = lines.slice(0, startIdx);
    const endContent = lines.slice(importIdx + 1);
    const newContent = [...startContent, newImportBlock, ...endContent].join('\n');
    writeFileSync(fp, newContent, 'utf-8');
    return usedIcons;
  } catch (e) {
    return [];
  }
}

function walk(dir) {
  let totalFiles = 0, totalIcons = 0;
  const results = [];
  try {
    for (const e of readdirSync(dir)) {
      const fp = join(dir, e);
      try {
        const st = statSync(fp);
        if (st.isDirectory() && !e.startsWith('.') && e !== 'node_modules' && e !== '__tests__' && e !== 'dist' && e !== 'locales' && e !== 'stubs' && e !== 'stories') {
          walk(fp);
        } else if (st.isFile() && extname(fp) === '.tsx') {
          const added = fixFile(fp);
          if (added.length > 0) {
            totalFiles++;
            totalIcons += added.length;
            results.push({ file: fp.replace(root, ''), added });
          }
        }
      } catch (e2) {}
    }
  } catch (e) {}
  return { totalFiles, totalIcons, results };
}

console.log('Fixing lucide-react imports...');
const result = walk(root);
console.log(`\nResult: ${result.totalFiles} files modified, ${result.totalIcons} icons added`);
result.results.sort((a, b) => b.added.length - a.added.length).slice(0, 50).forEach(f => {
  console.log(`  ${f.file}: +${f.added.join(', ')}`);
});
console.log(`\nTotal impacted files: ${result.totalFiles}`);
