export interface SidebarItem {
  label: string;
  icon?: string;
  route?: string;

  roles?: string[];
  privileges?: string[];

  children?: SidebarItem[];
}

