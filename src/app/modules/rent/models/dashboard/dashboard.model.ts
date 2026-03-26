export interface VehicleCategoryCount {
  categoryName?: string;
  vehicleCount: number;
}

export interface VehicleGroupSummary {
  groupName: string;
  categories: VehicleCategoryCount[];
}

