import { BookmarkNode, BookmarkStats } from '../types';

export const parseBookmarks = (htmlContent: string): { root: BookmarkNode; stats: BookmarkStats } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Create a virtual root
  const root: BookmarkNode = {
    id: 'root',
    title: 'Root',
    type: 'folder',
    children: [],
    addDate: Date.now()
  };

  let linkCount = 0;
  let folderCount = 0;
  const domainMap = new Map<string, number>();
  const yearMap = new Map<string, number>();
  const flatList: BookmarkNode[] = [];

  // Helper to extract domain
  const getDomain = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return 'unknown';
    }
  };

  // Recursive traversal
  const traverse = (domNode: Element, parent: BookmarkNode) => {
    const children = Array.from(domNode.children);
    
    // Chrome format uses DL -> DT -> (H3 for folder | A for link) -> DL (for folder content)
    // We iterate over DTs or bare elements depending on browser version variations
    
    for (const child of children) {
      if (child.tagName === 'DT') {
        const h3 = child.querySelector(':scope > h3');
        const a = child.querySelector(':scope > a');
        const dl = child.querySelector(':scope > dl');

        if (h3) {
          folderCount++;
          const newNode: BookmarkNode = {
            id: Math.random().toString(36).substr(2, 9),
            title: h3.textContent || 'Untitled Folder',
            type: 'folder',
            addDate: parseInt(h3.getAttribute('add_date') || '0', 10) * 1000,
            lastModified: parseInt(h3.getAttribute('last_modified') || '0', 10) * 1000,
            parentId: parent.id,
            children: []
          };
          parent.children?.push(newNode);
          if (dl) {
            traverse(dl, newNode);
          }
        } else if (a) {
          linkCount++;
          const url = a.getAttribute('href') || '';
          const addDateStr = a.getAttribute('add_date');
          const addDate = addDateStr ? parseInt(addDateStr, 10) * 1000 : Date.now();
          
          const newNode: BookmarkNode = {
            id: Math.random().toString(36).substr(2, 9),
            title: a.textContent || 'Untitled Link',
            url: url,
            type: 'link',
            addDate: addDate,
            parentId: parent.id
          };
          
          parent.children?.push(newNode);
          flatList.push(newNode);

          // Stats collection
          const domain = getDomain(url);
          if (domain !== 'unknown') {
            domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
          }

          const year = new Date(addDate).getFullYear().toString();
          yearMap.set(year, (yearMap.get(year) || 0) + 1);
        }
      } else if (child.tagName === 'DL') {
        // Sometimes DL is direct child
        traverse(child, parent);
      }
    }
  };

  // Find the main DL
  const mainDL = doc.querySelector('dl');
  if (mainDL) {
    traverse(mainDL, root);
  }

  // Process Stats
  const topDomains = Array.from(domainMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const bookmarksByYear = Array.from(yearMap.entries())
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([name, value]) => ({ name, value }));
  
  const mostRecent = [...flatList]
    .sort((a, b) => (b.addDate || 0) - (a.addDate || 0))
    .slice(0, 20);

  return {
    root,
    stats: {
      totalLinks: linkCount,
      totalFolders: folderCount,
      topDomains,
      bookmarksByYear,
      mostRecent
    }
  };
};