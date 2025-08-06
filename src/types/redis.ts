export interface CachedInventoryProduct {
  invId: number;
  storeId: number;
  storeManagerId: string;
  invItem: string;
  invItemBrand: string;
  invItemStock: number;
  invItemPrice: number;
  invItemType: string;
  invCreatedDate: Date; // or Date if you're parsing it
  invItemBarcode: string;
  invAdditional: Record<string, unknown>; // flexible, supports any shape
}
