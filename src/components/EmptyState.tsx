import React from 'react'
import { LucideIcon, FolderOpen, FileX, Search, Plus } from 'lucide-react'

/**
 * EmptyState Component
 * U9: 统一图标+文案+操作按钮
 */
interface EmptyStateProps {
  icon?: LucideIcon | string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }
  /** 自定义图标大小 */
  iconSize?: number
  /** 最小高度 */
  minHeight?: number | string
  className?: string
}

/**
 * 默认图标映射（按场景）
 */
export const EmptyStateIcons = {
  folder: FolderOpen,
  file: FileX,
  search: Search,
  plus: Plus,
  default: FolderOpen,
} as const

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  iconSize = 56,
  minHeight = 300,
  className = ''
}: EmptyStateProps) {
  // 渲染图标：可以是Lucide组件或emoji字符串
  const renderIcon = () => {
    if (!Icon) {
      const DefaultIcon = EmptyStateIcons.default
      return <DefaultIcon size={iconSize} strokeWidth={1.5} />
    }
    
    if (typeof Icon === 'string') {
      // emoji或其他字符串图标
      return <span style={{ fontSize: iconSize }}>{Icon}</span>
    }
    
    // Lucide图标组件
    return <Icon size={iconSize} strokeWidth={1.5} />
  }

  return (
    <div 
      className={`empty-state ${className}`}
      style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
    >
      <div className="empty-state__icon">
        {renderIcon()}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__desc">{description}</p>
      )}
      {action && (
        <div className="empty-state__action">
          <button 
            className={`btn btn-${action.variant || 'primary'}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  )
}

// 预设的空状态场景组件
export const NoDataEmpty = (props: Omit<EmptyStateProps, 'icon'>) => (
  <EmptyState 
    icon={EmptyStateIcons.folder} 
    title="暂无数据" 
    description="当前没有相关数据，请稍后再试或添加新数据"
    {...props}
  />
)

/**
 * E8: "暂无数据，去新建" 操作入口的空状态组件
 * 提供明确的新建操作入口
 */
export const NoDataEmptyAction = ({ onAction, actionLabel = '去新建' }: { onAction: () => void; actionLabel?: string }) => (
  <EmptyState
    icon={EmptyStateIcons.plus}
    title="暂无数据"
    description="当前没有相关数据"
    action={{
      label: actionLabel,
      onClick: onAction,
      variant: 'primary',
    }}
  />
)

export const SearchEmpty = (props: Omit<EmptyStateProps, 'icon'>) => (
  <EmptyState 
    icon={EmptyStateIcons.search} 
    title="搜索结果为空" 
    description="没有找到匹配的结果，请尝试其他关键词"
    {...props}
  />
)

export const ErrorEmpty = (props: Omit<EmptyStateProps, 'icon'>) => (
  <EmptyState 
    icon="⚠️" 
    title="加载失败" 
    description="数据加载出现问题，请检查网络后重试"
    action={{ label: '重新加载', variant: 'primary', onClick: () => window.location.reload() }}
    {...props}
  />
)

export default EmptyState
