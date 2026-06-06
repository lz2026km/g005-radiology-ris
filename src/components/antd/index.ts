/**
 * G005 放射RIS系统 v3.0.0 - antd 5 业务组件统一索引(W4)
 * Phase T2-W4: 50+ 业务组件封装
 *
 * 与已有 components/index.ts 并存:
 *   - components/index.ts           已有 11 个传统组件(保留)
 *   - components/antd/index.ts      本次新增 50+ antd 业务封装(本次)
 *
 * 用法:
 *   import { AppModal, ProTable, AppLayout } from '@components/antd';
 */

// ============= Feedback =============
export {
  useToast,
  useNotification,
  useConfirm,
  AppModal,
  AppSkeleton,
  type AppModalProps,
} from '../feedback/Toast';

export {
  AppEmpty,
  AppProgress,
  AppAlert,
  AppResult,
  type AppEmptyProps,
  type AppProgressProps,
  type AppAlertProps,
  type AppResultProps,
} from '../feedback';

// ============= Data =============
export {
  ProTable,
  AppStatistic,
  AppDescriptions,
  AppTabs,
  AppCollapse,
  AppSegmentedFilter,
  PageContainer,
  type ProTableProps,
  type ProColumn,
  type AppStatisticProps,
  type AppDescriptionsProps,
  type AppTabsProps,
  type AppCollapseProps,
  type AppSegmentedFilterProps,
  type PageContainerProps,
} from '../data/ProTable';

// ============= Forms =============
export {
  AppFormItem,
  AppSearchInput,
  AppTextInput,
  AppSelectField,
  AppDatePicker,
  AppDateRangeField,
  AppNumberField,
  AppTextArea,
  AppSwitchField,
  AppCheckboxField,
  AppRadioField,
  AppUploadField,
  AppUploadButton,
  AppTimePicker,
  AppCascaderField,
  AppSlider,
  AppRateField,
  AppAutoCompleteField,
  AppTreeSelectField,
  AppColorPickerField,
  AppMentionsField,
  type AppFormItemProps,
  type AppSearchInputProps,
  type AppTextInputProps,
  type AppSelectOption,
  type AppSelectFieldProps,
  type AppDatePickerProps,
  type AppDateRangeFieldProps,
  type AppNumberFieldProps,
  type AppTextAreaProps,
  type AppSwitchFieldProps,
  type AppCheckboxFieldProps,
  type AppRadioFieldProps,
  type AppUploadProps,
  type AppTimePickerProps,
  type AppCascaderOption,
  type AppCascaderFieldProps,
  type AppSliderProps,
  type AppRateFieldProps,
  type AppAutoCompleteFieldProps,
  type AppTreeSelectFieldProps,
  type AppColorPickerFieldProps,
} from '../forms/Form';

// ============= Layout =============
export {
  AppLayout,
  SplitLayout,
  CardSection,
  AppGrid,
  Stack,
  type AppLayoutProps,
  type SidebarItem,
  type SplitLayoutProps,
  type CardSectionProps,
  type AppGridProps,
  type StackProps,
} from '../layout/Layout';
