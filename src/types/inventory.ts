export type CategoryId = 'plugins' | 'skills' | 'mcp' | 'books';

export type PluginSubCategory = 'core' | 'tools' | 'workflow' | 'experiment';
export type SkillSubCategory = 'workflow' | 'ops' | 'ai-core' | 'multimodal' | 'office';
export type McpSubCategory = 'search' | 'research' | 'browser' | 'system';
export type BookSubCategory = 'pitfalls' | 'architecture' | 'agent-tricks' | 'container';

export type SubCategory = PluginSubCategory | SkillSubCategory | McpSubCategory | BookSubCategory | 'all';

export type QualityRarity = 'normal' | 'silver' | 'gold' | 'iridium';

export interface InventoryItem {
  id: string;
  name: string;
  chineseName: string;
  category: CategoryId;
  subCategory: SubCategory;
  rarity: QualityRarity;
  stackSize?: number;
  iconType: string; // SVG icon or custom pixel icon name
  customColor?: string;
  description: string;
  longDescription: string;
  version?: string;
  author: string;
  repoUrl?: string;
  installCommand?: string;
  configExample?: string;
  tags: string[];
  docId?: string; // Link to books
  highlights?: string[];
  tips?: string;
  createdDate: string;
}

export interface BookDocument {
  id: string;
  title: string;
  subtitle: string;
  category: 'books';
  subCategory: BookSubCategory;
  author: string;
  readTime: string;
  date: string;
  iconType: string;
  rarity: QualityRarity;
  summary: string;
  tags: string[];
  content: string; // Full markdown content
}
