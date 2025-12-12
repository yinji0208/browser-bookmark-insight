export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  addDate?: number;
  lastModified?: number;
  children?: BookmarkNode[];
  parentId?: string;
  type: 'folder' | 'link';
}

export interface BookmarkStats {
  totalLinks: number;
  totalFolders: number;
  topDomains: { name: string; value: number }[];
  bookmarksByYear: { name: string; value: number }[];
  mostRecent: BookmarkNode[];
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  EXPLORER = 'EXPLORER',
  AI_INSIGHTS = 'AI_INSIGHTS'
}
