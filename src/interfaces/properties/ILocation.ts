// TODO adauga un id pentru fiecare judet/localitate
// in baza de date nu vor fi stringuri, este mai usor sa le asociezi dupa un cod
// pe front end inputurile vor avea value=codul respectiv

export interface ILocation {
    lat: number;
    lng: number;
    ansambluRezidential? : boolean;
    judet: string;
    localitate: string;
    sector?: string;
    adresa?: string;
    codPostal?: string;
    vecinatati?: string;
};
