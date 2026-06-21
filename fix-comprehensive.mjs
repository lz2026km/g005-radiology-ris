/** 全面修复: 扫描所有 .tsx 文件，自动补全 lucide-react + antd 缺失 import */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const root = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src';

// All lucide-react icons
const LUCIDE = [
  'Activity','AlertCircle','AlertOctagon','AlertTriangle','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
  'Award','BarChart','BarChart2','BarChart3','BarChart4','Bell','BookOpen','Bookmark','BookmarkCheck',
  'Brain','Camera','Calendar','CalendarCheck','CalendarClock','CalendarDays','CalendarRange','CalendarX',
  'Check','CheckCheck','CheckCircle','CheckSquare','ChevronDown','ChevronLeft','ChevronRight','ChevronUp',
  'Circle','Clipboard','ClipboardCheck','ClipboardList','Clock','Clock3','Cpu','CreditCard','Database',
  'Download','Droplet','Edit','Edit2','Edit3','Equal','ExternalLink','Eye','EyeOff',
  'File','FileCheck','FileCode','FileEdit','FileImage','FilePlus','FileSearch','FileSpreadsheet','FileStack',
  'FileText','FileType','Filter','FilterX','Fingerprint','Flag','Flame','Focus','Folder','FolderTree',
  'Gauge','GitBranch','GitFork','GitMerge','Globe','GraduationCap','Grid','Grid3x3','Hash',
  'Headphones','Heart','HelpCircle','History','Home','Image','Inbox','Info','Italic','Key',
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
  'Bold','Underline',
];

const LUCIDE_SET = new Set(LUCIDE);

// Exclude HTML tags and common non-lucide components from false matching
const NOT_LUCIDE = new Set([
  'React','Fragment','Suspense','StrictMode','Profiler','Navigate','Routes','Route','Link','NavLink',
  'Outlet','BrowserRouter','HashRouter','MemoryRouter','useState','useEffect','useRef','useMemo',
  'useCallback','useReducer','useContext','useLayoutEffect','useNavigate','useLocation','useParams',
  'useTranslation','Trans','withTranslation','i18n','I18nextProvider','Loading','ErrorBoundary','AppLayout',
  'ToastProvider','NProgressBar','UndoToastProvider','Component','createElement','cloneElement','Children',
  'forwardRef','lazy','memo','createRef','useImperativeHandle','useDebugValue','useTransition',
  'useDeferredValue','startTransition','Sider','Content','Footer','Header',
  // antd
  'AutoComplete','Button','Card','Checkbox','Col','Collapse','DatePicker','Dropdown','Form','Input',
  'InputNumber','Layout','Menu','Modal','Pagination','Popconfirm','Popover','Progress','Radio','Row',
  'Select','Slider','Spin','Statistic','Steps','Switch','Table','Tabs','Tag','Timeline','Tooltip',
  'Transfer','Tree','TreeSelect','Typography','Upload','Badge','Alert','Descriptions','Drawer','Empty',
  'ConfigProvider','Breadcrumb','Anchor','BackTop','Affix','Calendar','Carousel','Avatar','Result',
  'Comment','List','Skeleton','Rate','Notification','Image','PageHeader','Cascader','Mentions',
  'TimePicker','Segmented','Space','Divider','Watermark','QRCode',
  // recharts
  'LineChart','AreaChart','BarChart','PieChart','RadarChart','RadialBarChart','ComposedChart',
  'ScatterChart','Line','Area','Bar','Pie','Cell','XAxis','YAxis','ZAxis','CartesianGrid','Tooltip',
  'Legend','ResponsiveContainer','PolarGrid','PolarAngleAxis','PolarRadiusAxis','Radar','RadialBar',
  'Funnel','FunnelChart','Treemap','Sankey','Label','LabelList',
  // lucide type aliases can't be used as components
  'LucideIcon','LucideProps','Icon',
]);

function fixFile(fp) {
  let content = readFileSync(fp, 'utf-8');
  if (!content.includes('lucide-react')) return [];

  // Find lucide import
  const lines = content.split('\n');
  let idx = lines.findIndex(l => l.includes('lucide-react'));
  if (idx === -1) return [];

  // Parse current import
  let start = idx;
  while (start > 0 && !lines[start].includes('import')) start--;
  const importBlock = lines.slice(start, idx + 1).join('\n');
  const bm = importBlock.match(/\{([\s\S]*?)\}/);
  if (!bm) return [];

  const curImports = bm[1].split(',').map(s => s.trim().replace(/ as \w+/g, '').trim()).filter(Boolean);

  // Detect icons used in JSX (as components)
  const used = [];
  for (const icon of LUCIDE) {
    if (curImports.includes(icon)) continue;
    if (NOT_LUCIDE.has(icon)) continue;
    // Check JSX usage patterns:
    // 1. <IconName ... or <IconName>
    const jsxRe = new RegExp('<' + icon + '(?=[\\s>])');
    // 2. icon={IconName} or icon: IconName (in config)
    const propRe = new RegExp('[=:]\\s*' + icon + '\\b');
    if (jsxRe.test(content) || propRe.test(content)) {
      used.push(icon);
    }
  }

  if (used.length === 0) return [];

  // Add to import
  const all = [...curImports, ...used];
  const unique = [...new Set(all)].sort((a, b) => a.localeCompare(b));
  const perLine = 8;
  const g = [];
  for (let i = 0; i < unique.length; i += perLine) g.push(unique.slice(i, i + perLine).join(', '));
  const newImport = `import {\n  ${g.join(',\n  ')},\n} from "lucide-react";`;
  const newLines = [...lines.slice(0, start), newImport, ...lines.slice(idx + 1)];
  writeFileSync(fp, newLines.join('\n'), 'utf-8');
  return used;
}

function walk(dir) {
  let total = 0, totalFiles = 0;
  const all = [];
  try {
    for (const e of readdirSync(dir)) {
      const fp = join(dir, e);
      try {
        const st = statSync(fp);
        if (st.isDirectory() && !['node_modules', 'dist', 'locales', 'stubs', '__tests__', 'coverage', '.git', 'stories'].includes(e))
          walk(fp);
        else if (extname(fp) === '.tsx') {
          const added = fixFile(fp);
          if (added.length > 0) {
            totalFiles++;
            total += added.length;
            all.push({ file: fp.replace(root, ''), added });
          }
        }
      } catch (e2) {}
    }
  } catch (e) {}
  return { totalFiles, total, all };
}

console.log('Comprehensive fix: Scanning  all .tsx files...');
const r = walk(root);
console.log(`\nResult: ${r.totalFiles} files modified, ${r.total} icons added`);
// Show only files with 3+ missing (most impactful)
r.all.filter(x => x.added.length >= 2).sort((a, b) => b.added.length - a.added.length).forEach(f => {
  console.log(`  ${f.file}: +${f.added.join(', ')}`);
});
