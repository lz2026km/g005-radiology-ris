/** 批量修复 lucide-react import - 改进版 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const root = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src';

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
  'ToggleLeft','ToggleRight','Tool','Trash','Trash2','TrendingDown','TrendingUp','Triangle','Trophy',
  'Type','Upload','User','UserCheck','UserCircle','UserMinus','UserPlus','UserX',
  'Users','UsersRound','Video','Volume','Volume1','Volume2','VolumeX','Wallet','Wand2','Watch',
  'Wifi','WifiOff','Wind','Wrench','X','XCircle','XSquare','Zap','ZoomIn','ZoomOut',
  'Box','Spline','Sprout','SquareIcon','ShieldOff','BookmarkMinus','BookmarkPlus','CalendarCheck',
  'ChevronsLeft','ChevronsRight','Cloud','CloudSun','Code','Coffee','Command','Compass','Crosshair',
  'Crown','Diff','DollarSign','FileSymlink','Folder','FolderOpen','GitCommit','GitPullRequest','Grid',
  'Headphones','HelpingHand','Laptop','Layers3','Link','List','LogOut','Mail','MailCheck',
  'MessageSquareShare','Newspaper','Notebook','NotebookPen','Paperclip','Pin','Pipette','Popcorn',
  'Radiation','Receipt','Repeat1','Rocket','Route','Rows','Rss','Ruler','ScatterChart',
  'Scissors','ScreenShare','SearchX','SendHorizontal','SeparatorHorizontal','SeparatorVertical',
  'Share','Sheet','Shirt','ShoppingBag','ShoppingCart','Shovel','Shrink','SidelPanel','Sidebar',
  'SidebarClose','SidebarOpen','Signal','SignalHigh','SignalLow','SignalMedium','SignalZero',
  'Siren','SkipBack','SkipForward','Skull','Slash','SlidersHorizontal','SlidersVertical',
  'SmartphoneNfc','Snooze','Snowflake','Sofa','SolarPanel','SoybeanMilk','Spade','Spellcheck',
  'Spinner','Spoon','Spotify','SprayCan','Sprout','SquareCheck','SquareCode','SquareDashed',
  'SquareDot','SquareEqual','SquareFunction','SquareKanban','SquareLibrary','SquareM',
  'SquareMenu','SquareMinus','SquareMousePointer','SquareParking','SquarePen','SquarePercent',
  'SquarePi','SquarePilcrow','SquarePlay','SquarePlus','SquarePower','SquareRadical',
  'SquareScissors','SquareSigma','SquareSquare','SquareStack','SquareTerminal','SquareUser',
  'SquareUserRound','SquareX','Squircle','Squirrel','Stamp','StarHalf','StarOff',
  'Stars','Steam','StepBack','StepForward','Stethoscope','Sticker','StickyNote',
  'Storage','Store','StretchHorizontal','StretchVertical','Strikethrough','Subscript',
  'Subtitles','SunDim','SunMedium','SunMoon','SunSnow','Sunrise','Sunset','Superscript',
  'SwatchBook','SwissFranc','SwitchCamera','Sword','Swords','Syringe','TableProperties',
  'Tablet','Tablets','Tag','Tags','Tally1','Tally2','Tally3','Tally4','Tally5',
  'Tangent','Target','Telescope','Tent','Terminal','TestTube','TestTubes','Text',
  'TextCursorInput','TextQuote','TextSearch','TextSelect','TextSize','Texture','Thermometer',
  'ThermometerSnowflake','ThermometerSun','ThumbsDown','ThumbsUp','Ticket','TicketCheck',
  'TicketMinus','TicketPercent','TicketPlus','TicketSlash','Timer','TimerOff','TimerReset',
  'ToggleLeft','ToggleRight','Tornado','Torus','Touchpad','TouchpadOff','TowerControl',
  'ToyBrick','Tractor','TrafficCone','Train','TrainTrack','TramFront','Trash','Trash2',
  'TreeDeciduous','TreePine','Trees','Trello','TrendingDown','TrendingUp','Triangle',
  'TriangleAlert','TriangleRight','Trophy','Truck','Turtle','Tv','TvMinimal','TvMinimalPlay',
  'Twitch','Twitter','Type','Umbrella','Underline','Undo','Undo2','UndoDot','UnfoldHorizontal',
  'UnfoldVertical','Ungroup','University','Unlink','Unlink2','Unlock','Unplug','Unplug2',
  'Upload','Usb','User','UserCog','UserCheck','UserCircle','UserMinus','UserPlus','UserRound',
  'UserRoundCheck','UserRoundCog','UserRoundMinus','UserRoundPlus','UserRoundSearch','UserRoundX',
  'UserSearch','UserX','Users','UsersRound','Utensils','UtensilsCrossed','UtilityPole',
  'Variable','Vault','Vegan','VenetianMask','Venus','VenusAndMars','Vibrate','VibrateOff',
  'Video','VideoOff','Videotape','View','ViewIcon','Voicemail','Volleyball','Volume',
  'Volume1','Volume2','VolumeOff','VolumeX','Vote','Wallet','Wallet2','WalletCards','WalletMinimal',
  'Wallpaper','Wand','Wand2','Warehouse','WashingMachine','Watch','Waves','Waypoints','Webcam',
  'Webhook','Weight','Wheat','WheatOff','WholeWord','Wifi','WifiHigh','WifiLow','WifiOff','WifiZero',
  'Wind','Wine','WineOff','Workflow','Worm','WrapText','Wrench','X','XCircle','XSquare',
  'Youtube','Zap','ZapOff','ZoomIn','ZoomOut',
];

// Lucide icons are NOT in this set - avoid confusing with HTML tags
const HTML_TAGS = new Set([
  'div','span','a','button','input','textarea','select','option','form','label','h1','h2','h3','h4','h5','h6',
  'p','br','hr','ul','ol','li','table','thead','tbody','tfoot','tr','th','td','img','svg','path','circle',
  'rect','line','polygon','polyline','ellipse','g','defs','clipPath','linearGradient','radialGradient',
  'stop','filter','mask','use','text','tspan','textPath','marker','pattern','style','script','link',
  'meta','title','head','body','html','nav','header','footer','main','section','article','aside',
  'figure','figcaption','details','summary','dialog','progress','meter','datalist','optgroup',
  'fieldset','legend','output','source','track','video','audio','canvas','iframe','embed','object',
  'param','base','col','colgroup','caption','colgroup','abbr','address','area','article','aside',
  'audio','b','bdi','bdo','blockquote','body','br','button','canvas','caption','cite','code',
  'col','colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl','dt','em',
  'embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head',
  'header','hgroup','hr','html','i','iframe','img','input','ins','kbd','label','legend','li','link',
  'main','map','mark','menu','meta','meter','nav','noscript','object','ol','optgroup','option',
  'output','p','picture','pre','progress','q','rp','rt','ruby','s','samp','script','search',
  'section','select','slot','small','source','span','strong','style','sub','summary','sup',
  'table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track',
  'u','ul','var','video','wbr',
]);

function fixFile(fp) {
  try {
    let content = readFileSync(fp, 'utf-8');
    if (!content.includes('lucide-react')) return [];

    const lines = content.split('\n');
    const importIdx = lines.findIndex(l => l.includes('lucide-react'));
    if (importIdx === -1) return [];

    // Parse current imports
    const currentImportLine = lines[importIdx];
    let currentImports = [];
    const braceMatch = currentImportLine.match(/\{\s*([\s\S]*?)\s*\}/);
    if (braceMatch) {
      currentImports = braceMatch[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim().split(/\s+/)[0]).filter(Boolean);
    }

    // Find ALL icon references in file (both JSX usage and in JS expressions)
    const usedIcons = new Set();
    for (const icon of LUCIDE_ICONS) {
      // Check if icon is referenced in JSX: <IconName... or iconIconName or icon={IconName}
      // Pattern: <IconName (at word boundary after <)
      const jsxRegex = new RegExp(`<${icon}(?=[\\s/>])`, 'g');
      const jsxUses = content.match(jsxRegex);
      // icon={IconName}
      const propRegex = new RegExp(`\\{${icon}\\}`, 'g');
      const propUses = content.match(propRegex);
      // icon: IconName (in config objects)
      const configRegex = new RegExp(`:\\s*${icon}\\b`, 'g');
      const configUses = content.match(configRegex);

      if ((jsxUses && jsxUses.length > 0) || (propUses && propUses.length > 0) || (configUses && configUses.length > 0)) {
        if (icon !== 'Style') {
          usedIcons.add(icon);
        }
      }
    }

    if (usedIcons.size === 0) return [];

    const missing = [...usedIcons].filter(name => !currentImports.includes(name));
    if (missing.length === 0) return [];

    // Check icons actually used in JSX rendering (not just in type definitions)
    // Remove icons that only appear in typeof expressions
    const actualMissing = missing.filter(name => {
      const regex1 = new RegExp(`<${name}(?=[\\s/>])`);
      const regex2 = new RegExp(`\\{${name}\\}`);
      return regex1.test(content) || regex2.test(content);
    });

    if (actualMissing.length === 0) return [];

    // Insert missing icons into import
    const newImport = currentImportLine.replace(/\{([^}]+)\}/, (_, inner) => {
      const items = inner.split(',').map(s => s.trim()).filter(Boolean);
      const all = [...items, ...actualMissing];
      const unique = [...new Set(all)];
      const sorted = unique.sort((a, b) => a.localeCompare(b));
      return `{ ${sorted.join(', ')} }`;
    });
    lines[importIdx] = newImport;
    writeFileSync(fp, lines.join('\n'), 'utf-8');
    return actualMissing;
  } catch (e) {
    return [];
  }
}

function walk(dir) {
  let totalFiles = 0, totalIcons = 0;
  const results = [];
  try {
    const entries = readdirSync(dir);
    for (const e of entries) {
      const fp = join(dir, e);
      try {
        const st = statSync(fp);
        if (st.isDirectory() && !e.startsWith('.') && e !== 'node_modules' && e !== '__tests__' && e !== 'dist' && e !== 'locales' && e !== 'stubs') {
          walk(fp);
        } else if (st.isFile() && (extname(fp) === '.tsx' || extname(fp) === '.ts')) {
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

console.log('Scanning and fixing lucide-react imports...');
const result = walk(root);
console.log(`\nTotal: ${result.totalFiles} files modified, ${result.totalIcons} icons added`);
result.results.sort((a, b) => b.added.length - a.added.length).slice(0, 40).forEach(f => {
  console.log(`  ${f.file}: +${f.added.join(', ')}`);
});
