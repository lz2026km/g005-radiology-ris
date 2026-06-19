import os

# Files to fix
fixes = [
    {
        'path': 'src/components/templates/designer/ConditionalLogicBuilder.tsx',
        'old': """  Modal, Empty, Alert, Divider, message, InputNumber,
} from 'antd';""",
        'new': """  Modal, Empty, Divider, message, InputNumber,
} from 'antd';"""
    },
    {
        'path': 'src/components/templates/designer/ConditionalLogicBuilder.tsx',
        'old': """import {
  Plus, Trash2, GitBranch, ChevronDown, ChevronRight, Zap, Code, Save,
  ArrowDown, Equal, NotEqual, Hash, Type, Calendar, ToggleLeft, ListChecks,
  AlertCircle, Check,
} from 'lucide-react';""",
        'new': """import {
  Plus, Trash2, GitBranch, ChevronDown, ChevronRight, Zap, Code, Save,
  ArrowDown, Hash, Type, Calendar, ToggleLeft, ListChecks,
  AlertCircle,
} from 'lucide-react';"""
    },
    {
        'path': 'src/components/templates/designer/TemplateInheritanceTree.tsx',
        'old': """import { Card, Tree, Tag, Space, Button, Tooltip, Empty } from 'antd';
import { FolderTree, GitBranch, ChevronRight, Layers, FileText, Edit, Eye } from 'lucide-react';""",
        'new': """import { Card, Tree, Tag, Space, Button } from 'antd';
import { FolderTree, Edit, Eye } from 'lucide-react';"""
    },
    {
        'path': 'src/components/templates/rads/RadsCalculator.tsx',
        'old': """  Empty, Modal, message,
  Alert, Radio,
} from 'antd';""",
        'new': """  Empty, Modal, message, Radio,
} from 'antd';"""
    },
    {
        'path': 'src/components/templates/rads/RadsCalculator.tsx',
        'old': """import {
  CheckCircle2, AlertTriangle, Upload, Lock, Calculator, Hash, Calendar,
  ChevronDown, ChevronUp, Image as ImageIcon, Edit3, Star, Info, Award,
  Activity, Heart, Brain, ListTree, FileText, Sparkles,
} from 'lucide-react';""",
        'new': """import {
  CheckCircle2, AlertTriangle, Upload, Lock, Calculator, Hash, Calendar,
  ChevronDown, ChevronUp, Image as ImageIcon, Edit3, Star, Award,
  Activity, Heart, Brain, ListTree, FileText, Sparkles,
} from 'lucide-react';"""
    },
    {
        'path': 'src/components/templates/rads/RadsCalculator.tsx',
        'old': """import type { RadsCalculatorRequest, RadsCalculatorResult } from '@/types/templates/calculations';""",
        'new': """import type { RadsCalculatorResult } from '@/types/templates/calculations';"""
    },
    {
        'path': 'src/components/templates/rads/RadsCalculator.tsx',
        'old': """const { TextArea } = Input;

""",
        'new': ""
    },
    {
        'path': 'src/components/templates/AutoFillSuggestions.tsx',
        'old': """import {
  Sparkles, ChevronRight, FileText, History, FlaskConical, Pill,
  Brain, User, BookOpen, Database, Shield as ShieldIcon, Check as CheckIcon, X, Wand2,
} from 'lucide-react';""",
        'new': """import {
  Sparkles, ChevronRight, History, FlaskConical, Pill,
  Brain, User, BookOpen, Database, Shield as ShieldIcon, Check as CheckIcon, X, Wand2,
} from 'lucide-react';"""
    },
    {
        'path': 'src/components/templates/AutoFillSuggestions.tsx',
        'old': """import {
  Card, List, Tag, Space, Button, Tooltip, Empty, Statistic, Row, Col,
  Switch, Alert, Tabs, Badge,
} from 'antd';""",
        'new': """import {
  Card, List, Tag, Space, Button, Tooltip, Empty, Statistic, Row, Col,
  Switch, Tabs, Badge,
} from 'antd';"""
    },
    {
        'path': 'src/components/templates/AutoReportPreview.tsx',
        'old': """  Space, Tag, Statistic, Row, Col, Tooltip, Empty,
  message, Switch, Input,
} from 'antd';""",
        'new': """  Space, Tag, Statistic, Row, Col, Empty,
  message, Switch, Input,
} from 'antd';"""
    },
    {
        'path': 'src/components/templates/AutoReportPreview.tsx',
        'old': """import {
  Eye, FileText, Code, ChevronRight, Save, ClipboardCopy, Sparkles,
  Database, FileEdit,
} from 'lucide-react';""",
        'new': """import {
  Eye, FileText, Code, ChevronRight, Save, ClipboardCopy, Sparkles,
  Database, FileEdit,
} from 'lucide-react';"""
    },
    {
        'path': 'src/components/templates/designer/ConditionalLogicBuilder.tsx',
        'old': """// 字段类型图标(为扩展预留)""",
        'new': ""
    },
    {
        'path': 'src/components/templates/designer/ConditionalLogicBuilder.tsx',
        'old': """// const FIELD_TYPE_ICON: Record<FieldType, React.ComponentType<{ className?: string }>> = {
  // string: Type, number: Hash, boolean: ToggleLeft, date: Calendar, enum: ListChecks, 'multi-enum': ListChecks,
  // };

""",
        'new': ""
    },
]

for fix in fixes:
    path = fix['path']
    if not os.path.exists(path):
        print(f'Skipped (not found): {path}')
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if fix['old'] in content:
        new_content = content.replace(fix['old'], fix['new'], 1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated: {path}')
    else:
        print(f'Pattern not found in {path}')
