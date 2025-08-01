export interface InventoryUpdate {
  p_id: number;
  quantity: number;
}

export interface InventoryMessage {
  user_id: string;
  store_id: number;
  inv_update: InventoryUpdate[];
}
