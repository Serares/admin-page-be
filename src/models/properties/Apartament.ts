import { Schema, model, Document } from 'mongoose';
import { ILocation } from "../../interfaces/properties/ILocation";
import { IPrice } from "../../interfaces/properties/IPrice";
import { IBuildingType } from "../../interfaces/properties/IBuildingType";
import { IEnergyCertificate } from '../../interfaces/properties/IEnergyCertificate';
import { ISurface } from '../../interfaces/properties/ISurface';
import { IRoomsNumbers } from '../../interfaces/properties/IRoomsNumbers';
import { IUtilities } from '../../interfaces/properties/IUtilities';
import { IIdentification } from '../../interfaces/properties/IIdentification';
import { IdentificationSchema } from './submodels/Identification';
import { LocationSchema } from './submodels/Location';
import { PriceSchema } from './submodels/Price';
import { RoomsSchema } from './submodels/Rooms';
import { BuildingTypeSchema } from './submodels/BuildingType';
import { ImagesSchema } from './submodels/Images';
import { IImages } from '../../interfaces/properties/IImages';

export interface IFeatures {
    home_type: number;
    partitioning: number;
};

interface ISpecifications {
    building_height: number,
    seismic_resistance: string,
    structure: string
};

/**
 * Features are unique for eache property
 */
const FeaturesSchema = new Schema<IFeatures>({
    home_type: {
        required: true,
        type: Schema.Types.Number
    },
    partitioning: {
        required: true,
        type: Schema.Types.Number
    },
    floor: Schema.Types.Number,
    comfort: Schema.Types.String,
    usable_area: Schema.Types.Number,
    total_usable_area: Schema.Types.Number,
    built_area: Schema.Types.Number,
    title: Schema.Types.String,
    description: Schema.Types.String
});

const SpecificationsSchema = new Schema<ISpecifications>({
    building_height: Schema.Types.Number,
    seismic_resistance: Schema.Types.String,
    structure: Schema.Types.String
});

// TODO add https://github.com/ai/nanoid as
// TODO try to translate it in english
// TODO search how to enforce some specific values for keys
// helps to extend the document for later db query
export type ApartmentDocument = Document & {
    identification: IIdentification;
    localization: ILocation;
    price: IPrice;
    rooms: IRoomsNumbers;
    building_type: IBuildingType;
    energyCertificate: IEnergyCertificate;
    surface: ISurface;
    utilities: IUtilities;
    features: IFeatures;
    specifications: ISpecifications;
    images: IImages
};

const ApartmentSchemaFields = {
    order: {
        required: true,
        type: Schema.Types.Number
    },
    identification: IdentificationSchema,
    localization: LocationSchema,
    price: PriceSchema,
    rooms: RoomsSchema,
    building_type: BuildingTypeSchema,
    features: FeaturesSchema,
    specifications: SpecificationsSchema,
    images: ImagesSchema
};

const ApartmentSchema = new Schema(ApartmentSchemaFields, { timestamps: true });

ApartmentSchema.pre("save", function (next) {
    const apartment = this as ApartmentDocument;
    if (!this.isNew) return next();
});

// adding generic type will help with later trying to query the DB
const Apartment = model<ApartmentDocument>("Apartment", ApartmentSchema, "apartments");
