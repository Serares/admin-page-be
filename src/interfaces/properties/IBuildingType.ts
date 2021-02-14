/**
 * building type
 */
export interface IBuildingType {
    type: string;
    floors_number: number;
    basement: boolean;
    semi_basement: boolean;
    ground_floor: boolean;
    attic: boolean;
    construction_status: string
}