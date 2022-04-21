import {
  DirectionsResponseData,
  LatLngArray,
} from "@googlemaps/google-maps-services-js";
import { decode } from "@googlemaps/polyline-codec";

export const getPathsFromDirectionResult = (result: DirectionsResponseData) => {
  const { routes } = result;

  if (!routes[0]) return;

  const { legs } = routes[0];

  const coordsTuples = legs.map((leg) => {
    const { steps } = leg;

    const paths = steps.reduce((prevValue, step) => {
      const decodedPath = decode(step!.polyline.points, 5);

      return [...prevValue, ...decodedPath];
    }, [] as LatLngArray[]);

    return paths;
  });

  const paths = coordsTuples.reduce((prevValue, coords) => {
    return [...prevValue, ...coords];
  }, [] as LatLngArray[]);

  const pathsEncoded = paths.map((path) => [path[0], path[1]].join("-"));

  return pathsEncoded;
};
