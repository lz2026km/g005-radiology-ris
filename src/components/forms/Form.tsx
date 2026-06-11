/**
 * G005 放射RIS系统 v3.0.0 - Forms 业务组件
 * Phase T2-W4: FormField / SearchInput / DateRangeField / UploadField / SelectField
 */

import { useState, forwardRef, type ReactNode } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Switch,
  Checkbox,
  Radio,
  Upload,
  Button,
  Cascader,
  AutoComplete,
  Mentions,
  Slider,
  Rate,
  ColorPicker,
  TreeSelect,
  Slider as AntSlider,
} from 'antd';
import { UploadOutlined, InboxOutlined, SearchOutlined } from '@ant-design/icons';
import type { FormItemProps } from 'antd';
import { useTranslation } from 'react-i18next';

// ============= FormItem 业务封装 =============
export interface AppFormItemProps extends Omit<FormItemProps, 'label'> {
  label?: ReactNode;
  required?: boolean;
  tooltip?: ReactNode;
  description?: ReactNode;
}

export function AppFormItem({
  label,
  required = false,
  tooltip,
  description,
  children,
  ...restProps
}: AppFormItemProps) {
  return (
    <Form.Item
      label={label}
      required={required}
      tooltip={tooltip}
      extra={description}
      rules={required ? [{ required: true, message: `${label} is required` }] : restProps.rules}
      {...restProps}
    >
      {children}
    </Form.Item>
  );
}

// ============= SearchInput 业务封装(回车搜索) =============
export interface AppSearchInputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  allowClear?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  /** 搜索按钮 */
  enterButton?: boolean | ReactNode;
  /** 宽度 */
  width?: number | string;
}

export const AppSearchInput = forwardRef<unknown, AppSearchInputProps>(function AppSearchInput(
  { value, defaultValue, placeholder, onChange, onSearch, allowClear = true, disabled, size = 'middle', enterButton, width = 280 },
  ref
) {
  const { t } = useTranslation();
  return (
    <Input.Search
      ref={ref as never}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder ?? t('common.search')}
      onChange={(e) => onChange?.(e.target.value)}
      onSearch={onSearch}
      allowClear={allowClear}
      disabled={disabled}
      size={size}
      enterButton={enterButton ?? <SearchOutlined />}
      style={{ width }}
      aria-label={t('common.search')}
    />
  );
});

// ============= TextInput 业务封装 =============
export interface AppTextInputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onPressEnter?: () => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
  allowClear?: boolean;
  disabled?: boolean;
  maxLength?: number;
  type?: 'text' | 'password' | 'email' | 'tel' | 'url' | 'number';
  size?: 'small' | 'middle' | 'large';
  status?: 'error' | 'warning';
}

export const AppTextInput = forwardRef<unknown, AppTextInputProps>(function AppTextInput(props, ref) {
  return (
    <Input
      ref={ref as never}
      value={props.value}
      defaultValue={props.defaultValue}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange?.(e.target.value)}
      onPressEnter={props.onPressEnter}
      prefix={props.prefix}
      suffix={props.suffix}
      allowClear={props.allowClear}
      disabled={props.disabled}
      maxLength={props.maxLength}
      type={props.type}
      size={props.size}
      status={props.status}
    />
  );
});

// ============= SelectField 业务封装 =============
export interface AppSelectOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
  /** 搜索关键词 */
  searchText?: string;
}

export interface AppSelectFieldProps {
  value?: string | number | Array<string | number>;
  defaultValue?: string | number | Array<string | number>;
  options: AppSelectOption[];
  onChange?: (value: unknown) => void;
  placeholder?: string;
  mode?: 'multiple' | 'tags';
  allowClear?: boolean;
  showSearch?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  /** 自定义过滤(默认按 label 搜索) */
  filterOption?: (input: string, option?: AppSelectOption) => boolean;
  /** 加载状态 */
  loading?: boolean;
}

export function AppSelectField({
  value,
  defaultValue,
  options,
  onChange,
  placeholder,
  mode,
  allowClear = true,
  showSearch = true,
  disabled,
  size = 'middle',
  filterOption,
  loading = false,
  'aria-label': ariaLabel,
  ...rest
}: AppSelectFieldProps & { 'aria-label'?: string; [key: string]: unknown }) {
  const { t } = useTranslation();
  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      options={options as never}
      onChange={onChange}
      placeholder={placeholder ?? t('common.pleaseSelect')}
      aria-label={ariaLabel}
      mode={mode}
      allowClear={allowClear}
      showSearch={showSearch}
      disabled={disabled}
      size={size}
      loading={loading}
      filterOption={filterOption as never ?? ((input, opt) => {
        const o = opt as unknown as AppSelectOption;
        const searchStr = o.searchText ?? (typeof o.label === 'string' ? o.label : '');
        return String(searchStr).toLowerCase().includes(input.toLowerCase());
      })}
    />
  );
}

// ============= DatePicker 业务封装 =============
export interface AppDatePickerProps {
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (value: unknown, dateString: string) => void;
  placeholder?: string;
  format?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showTime?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export function AppDatePicker(props: AppDatePickerProps) {
  return (
    <DatePicker
      value={props.value as never}
      defaultValue={props.defaultValue as never}
      onChange={props.onChange as never}
      placeholder={props.placeholder}
      format={props.format ?? 'YYYY-MM-DD'}
      disabled={props.disabled}
      allowClear={props.allowClear ?? true}
      showTime={props.showTime}
      size={props.size}
    />
  );
}

// ============= DateRangeField =============
export interface AppDateRangeFieldProps {
  value?: [unknown, unknown];
  defaultValue?: [unknown, unknown];
  onChange?: (value: [unknown, unknown], dateStrings: [string, string]) => void;
  placeholder?: [string, string];
  format?: string;
  disabled?: boolean;
  showTime?: boolean;
}

export function AppDateRangeField(props: AppDateRangeFieldProps) {
  return (
    <DatePicker.RangePicker
      value={props.value as never}
      defaultValue={props.defaultValue as never}
      onChange={props.onChange as never}
      placeholder={props.placeholder as never}
      format={props.format ?? 'YYYY-MM-DD'}
      disabled={props.disabled}
      showTime={props.showTime}
      style={{ width: '100%' }}
    />
  );
}

// ============= NumberField =============
export interface AppNumberFieldProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function AppNumberField(props: AppNumberFieldProps) {
  return (
    <InputNumber
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={props.onChange}
      min={props.min}
      max={props.max}
      step={props.step}
      precision={props.precision}
      disabled={props.disabled}
      placeholder={props.placeholder}
      prefix={props.prefix}
      suffix={props.suffix}
      style={{ width: '100%' }}
    />
  );
}

// ============= TextArea =============
export interface AppTextAreaProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  autoSize?: boolean | { minRows: number; maxRows: number };
  disabled?: boolean;
}

export function AppTextArea({
  value,
  defaultValue,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  showCount = false,
  autoSize = false,
  disabled,
}: AppTextAreaProps) {
  return (
    <Input.TextArea
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      showCount={showCount}
      autoSize={autoSize}
      disabled={disabled}
    />
  );
}

// ============= SwitchField =============
export interface AppSwitchFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  checkedChildren?: ReactNode;
  unCheckedChildren?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export function AppSwitchField(props: AppSwitchFieldProps) {
  return (
    <Switch
      checked={props.checked}
      defaultChecked={props.defaultChecked}
      onChange={props.onChange}
      checkedChildren={props.checkedChildren}
      unCheckedChildren={props.unCheckedChildren}
      disabled={props.disabled}
      loading={props.loading}
    />
  );
}

// ============= CheckboxField =============
export interface AppCheckboxFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: { target: { checked: boolean } }) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function AppCheckboxField(props: AppCheckboxFieldProps) {
  return (
    <Checkbox
      checked={props.checked}
      defaultChecked={props.defaultChecked}
      onChange={props.onChange}
      disabled={props.disabled}
    >
      {props.children}
    </Checkbox>
  );
}

// ============= RadioField =============
export interface AppRadioFieldProps {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: { target: { value: string | number } }) => void;
  options: Array<{ label: ReactNode; value: string | number; disabled?: boolean }>;
  disabled?: boolean;
  optionType?: 'default' | 'button';
}

export function AppRadioField(props: AppRadioFieldProps) {
  return (
    <Radio.Group
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={props.onChange as never}
      disabled={props.disabled}
      optionType={props.optionType}
    >
      {props.options.map((opt) => (
        <Radio key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </Radio>
      ))}
    </Radio.Group>
  );
}

// ============= UploadField =============
export interface AppUploadProps {
  value?: unknown;
  onChange?: (info: unknown) => void;
  /** 上传地址 */
  action?: string;
  /** 是否多文件 */
  multiple?: boolean;
  /** 接受文件类型 */
  accept?: string;
  /** 上传前钩子 */
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  /** 列表类型 */
  listType?: 'text' | 'picture' | 'picture-card';
  /** 文件大小限制(MB) */
  maxSize?: number;
  disabled?: boolean;
  children?: ReactNode;
  /** a11y 标签 */
  ariaLabel?: string;
}

export function AppUploadField({
  value,
  onChange,
  action = '/api/upload',
  multiple = false,
  accept,
  beforeUpload,
  listType = 'text',
  maxSize = 100,
  disabled,
  children,
  ariaLabel,
}: AppUploadProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  return (
    <Upload.Dragger
      {...({ value, onChange } as never)}
      action={action}
      multiple={multiple}
      accept={accept}
      beforeUpload={beforeUpload ?? ((file) => {
        if (file.size / 1024 / 1024 > maxSize) {
          // eslint-disable-next-line no-console
          console.error(`File too large: ${file.name} > ${maxSize}MB`);
          return false;
        }
        return true;
      })}
      listType={listType}
      disabled={disabled}
      aria-label={ariaLabel ?? t('common.upload')}
      onChange={(info) => {
        setLoading(info.file.status === 'uploading');
        onChange?.(info);
      }}
    >
      <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
        <InboxOutlined style={{ fontSize: 48, color: 'var(--color-primary-500)' }} />
      </p>
      <p className="ant-upload-text" style={{ marginBottom: 4 }}>
        {children ?? t('common.upload')}
      </p>
      <p className="ant-upload-hint" style={{ color: 'var(--color-gray-500)', fontSize: 12 }}>
        支持 {accept ?? '任意文件'}, ≤ {maxSize}MB
      </p>
    </Upload.Dragger>
  );
}

// ============= TimePicker =============
export interface AppTimePickerProps {
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (value: unknown, timeString: string) => void;
  format?: string;
  disabled?: boolean;
  use12Hours?: boolean;
}

export function AppTimePicker(props: AppTimePickerProps) {
  return (
    <TimePicker
      value={props.value as never}
      defaultValue={props.defaultValue as never}
      onChange={props.onChange as never}
      format={props.format ?? 'HH:mm'}
      disabled={props.disabled}
      use12Hours={props.use12Hours}
      style={{ width: '100%' }}
    />
  );
}

// ============= CascaderField =============
export interface AppCascaderOption {
  value: string | number;
  label: ReactNode;
  children?: AppCascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;
}

export interface AppCascaderFieldProps {
  value?: Array<string | number>;
  defaultValue?: Array<string | number>;
  options: AppCascaderOption[];
  onChange?: (value: Array<string | number>, selectedOptions?: AppCascaderOption[]) => void;
  placeholder?: string;
  disabled?: boolean;
  changeOnSelect?: boolean;
  showSearch?: boolean;
}

export function AppCascaderField(props: AppCascaderFieldProps) {
  return (
    <Cascader
      value={props.value}
      defaultValue={props.defaultValue}
      options={props.options as never}
      onChange={props.onChange as never}
      placeholder={props.placeholder}
      disabled={props.disabled}
      changeOnSelect={props.changeOnSelect}
      showSearch={props.showSearch}
      style={{ width: '100%' }}
    />
  );
}

// ============= Slider =============
export interface AppSliderProps {
  value?: number | [number, number];
  defaultValue?: number | [number, number];
  onChange?: (value: number | [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  marks?: Record<number, ReactNode>;
  disabled?: boolean;
}

export function AppSlider(props: AppSliderProps) {
  return (
    <AntSlider
      value={props.value as never}
      defaultValue={props.defaultValue as never}
      onChange={props.onChange as never}
      min={props.min ?? 0}
      max={props.max ?? 100}
      step={props.step}
      range={props.range}
      marks={props.marks}
      disabled={props.disabled}
    />
  );
}

// ============= RateField =============
export interface AppRateFieldProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  disabled?: boolean;
}

export function AppRateField(props: AppRateFieldProps) {
  return (
    <Rate
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={props.onChange}
      count={props.count ?? 5}
      allowHalf={props.allowHalf}
      disabled={props.disabled}
    />
  );
}

// ============= AutoCompleteField =============
export interface AppAutoCompleteFieldProps {
  value?: string;
  defaultValue?: string;
  options: Array<{ value: string; label?: ReactNode }>;
  onChange?: (value: string) => void;
  onSelect?: (value: string, option: { value: string }) => void;
  placeholder?: string;
  filterOption?: boolean | ((input: string, option?: { value: string }) => boolean);
}

export function AppAutoCompleteField(props: AppAutoCompleteFieldProps) {
  return (
    <AutoComplete
      value={props.value}
      defaultValue={props.defaultValue}
      options={props.options as never}
      onChange={props.onChange}
      onSelect={props.onSelect as never}
      placeholder={props.placeholder}
      filterOption={props.filterOption as never}
      style={{ width: '100%' }}
    />
  );
}

// ============= TreeSelectField =============
export interface AppTreeSelectFieldProps {
  value?: string | number;
  defaultValue?: string | number;
  treeData: Array<{ value: string | number; title: ReactNode; children?: unknown[] }>;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  multiple?: boolean;
  treeCheckable?: boolean;
  disabled?: boolean;
}

export function AppTreeSelectField(props: AppTreeSelectFieldProps) {
  return (
    <TreeSelect
      value={props.value}
      defaultValue={props.defaultValue}
      treeData={props.treeData as never}
      onChange={props.onChange as never}
      placeholder={props.placeholder}
      multiple={props.multiple}
      treeCheckable={props.treeCheckable}
      disabled={props.disabled}
      style={{ width: '100%' }}
    />
  );
}

// ============= ColorPickerField =============
export interface AppColorPickerFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  showText?: boolean;
}

export function AppColorPickerField(props: AppColorPickerFieldProps) {
  return (
    <ColorPicker
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={(c) => props.onChange?.(c.toHexString())}
      disabled={props.disabled}
      showText={props.showText}
    />
  );
}

// ============= MentionsField =============
export function AppMentionsField(props: { value?: string; onChange?: (v: { value: string }) => void; options: Array<{ value: string; label: string }>; placeholder?: string }) {
  return (
    <Mentions
      value={props.value}
      onChange={props.onChange as never}
      options={props.options as never}
      placeholder={props.placeholder}
    />
  );
}

// ============= FileUploadButton(普通按钮上传) =============
export function AppUploadButton({
  onUpload,
  accept,
  multiple = false,
  children,
}: {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  children: ReactNode;
}) {
  return (
    <Upload
      accept={accept}
      multiple={multiple}
      showUploadList={false}
      beforeUpload={(file, fileList) => {
        if (file) onUpload([file]);
        if (fileList.length > 1) onUpload(fileList);
        return false;  // 阻止自动上传
      }}
    >
      <Button icon={<UploadOutlined />}>{children}</Button>
    </Upload>
  );
}

// ============= 导出 =============
// 注意:在 index.ts 中统一导出
