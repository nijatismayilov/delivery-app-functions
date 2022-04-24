import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import {
//   // randEmail,
//   // randPhoneNumber,
//   // randFullName,
//   randText,
// } from "@ngneat/falso";
// import {
//   Client,
//   LatLng,
//   LatLngArray,
// } from "@googlemaps/google-maps-services-js";
// import axios from "axios";
// import { QueryDocumentSnapshot } from "firebase-functions/v1/firestore";
// import { places } from "./places";
// import { getPathsFromDirectionResult } from "./utils";

admin.initializeApp();

const db = admin.firestore();
// const client = new Client({ axiosInstance: axios });

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// type Parcels =
//   admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>[];

// interface GetLocationsResult {
//   origin: string;
//   destination: string;
//   waypoints: LatLngArray[];
// }

// const getWaypoints = (parcels: Parcels): LatLngArray[] => {
//   const waypoints = parcels.map(parcel => [parcel.data().origin, parcel.data().destination] as LatLngArray);

//   return waypoints;
// }

// const getLocations = async (parcels: Parcels): GetLocationsResult => {
//   if (parcels.length === 1) {
//     const parcel = parcels[0];
//     const parcelData = parcel.data();

//     return {
//       origin: parcelData.origin,
//       destination: parcelData.destination,
//       waypoints: [],
//     };
//   }

//   if (parcels.length === 2) {
//     const parcel1 = parcels[0];
//     const parcel2 = parcels[1];
//     const parcel1Data = parcel1.data();
//     const parcel2Data = parcel2.data();

//     return {
//       origin: parcel1Data.origin,
//       destination: parcel2Data.destination,
//       waypoints: [
//         [parcel1Data.destination, parcel2Data.origin],
//       ],
//     };
//   }

//   const waypoints = getWaypoints(parcels);

// }

// const adjustUsers = async () => {
//   const usersRef = db.collection("users");
//   // const users = await usersRef.get();
//   const batch = db.batch();

//   const newUsersCount = Math.floor(Math.random() * 25);
//   // const deletedUsersCount =
//   //   users.docs.length <= 10 ? 4 : Math.floor(Math.random() * 10);

//   for (let i = 0; i < newUsersCount; i++) {
//     const fullName = randFullName();
//     const firstName = fullName.split(" ")[0];
//     const lastName = fullName.split(" ")[1];

//     const user = {
//       email: randEmail(),
//       firstName,
//       lastName,
//       phoneNumber: randPhoneNumber(),
//       parcels: [],
//     };

//     batch.set(usersRef.doc(), user);
//   }

//   // for (let i = 0; i < deletedUsersCount; i++) {
//   //   const user = users.docs[Math.floor(Math.random() * users.docs.length)];

//   //   if (user.data().parcels.length !== 0) continue;

//   //   console.log("deleting user", user.id);
//   //   batch.delete(user.ref);
//   // }

//   await batch.commit();
// };

const trackVehicles = async () => {
  const vehiclesRef = db.collection("vehicles");
  const parcelsRef = db.collection("parcels");
  const vehicles = await vehiclesRef.get();
  const batch = db.batch();

  const notIdleVehicles = vehicles.docs.filter(
    (vehicle) => vehicle.data().status !== "idle"
  );

  notIdleVehicles.forEach(async (vehicle) => {
    const vehicleRef = vehiclesRef.doc(vehicle.id);
    const vehicleData = vehicle.data();
    const prevDeliveryProgress = vehicleData.deliveryProgress;
    const simulationSpeed = 1 / (vehicleData.paths.length || 20);

    if (prevDeliveryProgress >= 1) {
      vehicleData.parcels.forEach((parcelId: string) => {
        const parcelRef = parcelsRef.doc(parcelId);
        batch.update(parcelRef, {
          status: "Delivered",
        });
      });

      batch.update(vehicleRef, {
        deliveryProgress: 0,
        status: "idle",
        parcels: [],
        paths: [],
      });

      return;
    }

    batch.update(vehicleRef, {
      deliveryProgress: prevDeliveryProgress + simulationSpeed,
    });
  });

  await batch.commit();
};

// const addParcels = async () => {
//   const parcelsRef = db.collection("parcels");
//   const usersRef = db.collection("users");
//   const users = await usersRef.get();
//   const batch = db.batch();

//   const newParcelsCount = Math.floor(Math.random() * 50);

//   for (let i = 0; i < newParcelsCount; i++) {
//     const user = users.docs[Math.floor(Math.random() * users.docs.length)];
//     const origin = places[Math.floor(Math.random() * places.length)];
//     const destination = places[Math.floor(Math.random() * places.length)];

//     const res = await client.directions({
//       params: {
//         origin: origin.properties.formatted,
//         destination: destination.properties.formatted,
//         key: "AIzaSyB3mwDlUpE2G4pMlnPIeJHv4R7kAqmHKsM",
//       },
//     });
//     console.log(res.data);
//     const paths = getPathsFromDirectionResult(res.data);
//     const parcel = {
//       status: "Inventory",
//       userId: user.id,
//       description: randText({ length: Math.floor(Math.random() * 100) }),
//       origin: origin.properties.formatted,
//       destination: destination.properties.formatted,
//       paths,
//     };

//     const parcelRef = parcelsRef.doc();

//     batch.set(parcelRef, parcel);
//     batch.update(usersRef.doc(user.id), {
//       parcels: admin.firestore.FieldValue.arrayUnion(parcelRef.id),
//     });
//   }

//   await batch.commit();
// };

// const sendToDelivery = async () => {
//   const parcelsRef = db.collection("parcels");
//   const vehiclesRef = db.collection("vehicles");
//   const vehicles = await vehiclesRef.get();
//   const parcels = await parcelsRef.get();
//   const batch = db.batch();

//   const allInventoryParcels = parcels.docs.filter(
//     (parcel) => parcel.data().status === "Inventory"
//   );

//   const inventoryParcelsToSend = allInventoryParcels.filter(
//     (_parcel, index) => index < 50
//   );

//   let waypoints: LatLngArray[] | undefined = undefined;
//   let origin: string = "";
//   let destination: string = "";

//   const waypoints: LatLngArray[] | undefined = inventoryParcelsToSend.length > 1 ? ;

//   if (inventoryParcelsToSend.length !== 1) {
//     const waypointsTuples = inventoryParcelsToSend.map((parcel, index) => {
//       const parcelData = parcel.data();

//       if (!parcel.exists) return [];

//       if (index === 0) {
//         origin = parcelData.origin;
//         return [{ location: parcelData.destination, stopover: true }];
//       }

//       if (index === inventoryParcelsToSend.length - 1) {
//         destination = parcelData.destination;
//         return [{ location: parcelData.origin, stopover: true }];
//       }

//       return [
//         { location: parcelData.origin, stopover: true },
//         { location: parcelData.destination, stopover: true },
//       ];
//     });

//     waypoints = waypointsTuples.reduce((prev, waypointsTuple) => {
//       return [...prev, ...waypointsTuple];
//     }, [] as GeocodedWaypoint[]);
//   } else {
//     const parcel = inventoryRows.find(
//       (row) => row.id === (inventoryParcelsSelectionModel[0] as string)
//     );

//     if (!parcel) return;

//     origin = parcel.origin;
//     destination = parcel.destination;
//   }

//   const res = await client.directions({
//     params: {
//       origin: origin.properties.formatted,
//       destination: destination.properties.formatted,
//       key: "AIzaSyB3mwDlUpE2G4pMlnPIeJHv4R7kAqmHKsM",

//     },
//   });

//   const notIdleVehicles = vehicles.docs.filter(
//     (vehicle) => vehicle.data().status !== "idle"
//   );
// };

// export const adjustUsersScheduled = functions.pubsub
//   .schedule("* * * * *")
//   .onRun(async (context) => {
//     const promises: Promise<any>[] = [];

//     promises.push(adjustUsers());

//     return Promise.all(promises);
//   });

export const trackVehiclesScheduled = functions.pubsub
  .schedule("* * * * *")
  .onRun(async (context) => {
    const promises: Promise<any>[] = [];

    promises.push(trackVehicles());
    await sleep(10000);
    promises.push(trackVehicles());
    await sleep(10000);
    promises.push(trackVehicles());
    await sleep(10000);
    promises.push(trackVehicles());
    await sleep(10000);
    promises.push(trackVehicles());

    return Promise.all(promises);
  });

// export const addParcelsScheduled = functions.pubsub
//   .schedule("* * * * *")
//   .onRun(async (context) => {
//     const promises: Promise<any>[] = [];

//     promises.push(addParcels());

//     return Promise.all(promises);
//   });
