declare namespace google.maps.places {
  interface AutocompletePrediction {
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
    types: string[];
  }

  interface AutocompleteService {
    getPlacePredictions(
      request: AutocompletionRequest,
      callback?: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
    ): Promise<AutocompleteResponse>;
  }

  interface AutocompletionRequest {
    input: string;
    componentRestrictions?: {
      country: string | string[];
    };
    types?: string[];
  }

  interface AutocompleteResponse {
    predictions: AutocompletePrediction[];
  }

  interface PlacesService {
    getDetails(
      request: PlaceDetailsRequest,
      callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void
    ): void;
  }

  interface PlaceDetailsRequest {
    placeId: string;
    fields?: string[];
  }

  interface PlaceResult {
    address_components?: AddressComponent[];
    formatted_address?: string;
    geometry?: {
      location: google.maps.LatLng;
    };
    name?: string;
    place_id?: string;
  }

  interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  enum PlacesServiceStatus {
    OK = 'OK',
    ZERO_RESULTS = 'ZERO_RESULTS',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    NOT_FOUND = 'NOT_FOUND'
  }
} 