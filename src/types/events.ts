export interface InventoryUpdate {
  p_id: number;
  quantity: number;
}

export interface InventoryMessage {
  user_id: string;
  store_id: number;
  inv_update: InventoryUpdate[];
}

export interface SalesEvent {
  purchases: {
    product_id: number;
    product_current_stock: number;
    product_name: string;
    product_price: number;
    productQuantity: number;
  }[];
  purchase_time: string;
}

export interface SalesMessage {
  store_id: number;
  user_id: string;
  sales_records: SalesEvent[];
}
