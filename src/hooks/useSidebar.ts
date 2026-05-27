/**
 * useSidebar Hook - 侧边栏状态管理
 * G005 Radiology RIS System
 */
import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
}

interface SidebarSection {
  section: string;
  items: SidebarItem[];
}

interface UseSidebarReturn {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  filteredItems: SidebarSection[];
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
}

export function useSidebar(
  sidebarItems: SidebarSection[],
  currentRoles: string[]
): UseSidebarReturn {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const filteredItems = useMemo(() => {
    return sidebarItems
      .map(section => ({
        ...section,
        items: section.items.filter(item => 
          item.roles.some(role => currentRoles.includes(role))
        ),
      }))
      .filter(section => section.items.length > 0);
  }, [sidebarItems, currentRoles]);

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  return {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    filteredItems,
    isActive,
    navigate,
  };
}

export default useSidebar;