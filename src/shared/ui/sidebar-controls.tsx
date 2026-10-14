import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SidebarToggleProps {
  collapsed: boolean;
  isVi: boolean;
  onToggle: () => void;
}

interface SidebarSearchProps {
  query: string;
  isVi: boolean;
  onChange: (query: string) => void;
}

export function SidebarToggle({ collapsed, isVi, onToggle }: SidebarToggleProps) {
  const label = collapsed
    ? isVi ? 'Mở rộng thanh bên' : 'Expand sidebar'
    : isVi ? 'Thu gọn thanh bên' : 'Collapse sidebar';
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <button
      type="button"
      className="member-sidebar__toggle"
      aria-label={label}
      title={label}
      aria-expanded={!collapsed}
      onClick={onToggle}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
    </button>
  );
}

export function SidebarSearch({ query, isVi, onChange }: SidebarSearchProps) {
  const label = isVi ? 'Tìm trong menu' : 'Search menu';

  return (
    <div className="member-sidebar__search-section">
      <label className="member-sidebar__search">
        <Search aria-hidden="true" size={16} strokeWidth={1.8} />
        <input
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder={label}
          aria-label={label}
        />
      </label>
      <h2 className="member-sidebar__section-heading">Menu</h2>
    </div>
  );
}

export function matchesSidebarSearch(label: string, query: string) {
  return label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}

export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 860px)');
    const resetOnMobile = () => {
      if (mobile.matches) setCollapsed(false);
    };
    mobile.addEventListener('change', resetOnMobile);
    return () => mobile.removeEventListener('change', resetOnMobile);
  }, []);

  return [collapsed, setCollapsed] as const;
}

export function useSidebarFlyout() {
  const [flyout, setFlyout] = useState<{ id: string; top: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeFlyout = useCallback(() => setFlyout(null), []);

  const toggleFlyout = (id: string, trigger: HTMLElement, itemCount: number) => {
    triggerRef.current = trigger;
    const availableHeight = Math.min(window.innerHeight * 0.7, 52 + itemCount * 40);
    const top = Math.max(
      12,
      Math.min(trigger.getBoundingClientRect().top, window.innerHeight - availableHeight - 12),
    );
    setFlyout((current) => (current?.id === id ? null : { id, top }));
  };

  useEffect(() => {
    if (!flyout) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFlyout();
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest('.member-nav-group__trigger, .member-nav-children.is-flyout-open')
      ) {
        closeFlyout();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [closeFlyout, flyout]);

  return { flyout, toggleFlyout, closeFlyout };
}
