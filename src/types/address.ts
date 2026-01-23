export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}
