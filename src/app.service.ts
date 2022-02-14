import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cities from '../public/cities.json';

@Injectable()
export class AppService {
  async filterUsers(inputCity, inputDistance): Promise<any> {
    if (!inputCity || !inputDistance) {
      throw new BadRequestException('Filter fields missing');
    }

    inputCity = inputCity.toLowerCase();
    const selectedCity = cities.find((item) => {
      return item.city.toLowerCase() === inputCity;
    });
    const selectedCoordinates: [number, number] = [
      parseFloat(selectedCity.lat),
      parseFloat(selectedCity.lng),
    ];

    console.log(selectedCoordinates);
    const capitalizedCity = inputCity[0].toUpperCase() + inputCity.slice(1);

    const usersByCityResponse = await axios.get(
      `https://bpdts-test-app.herokuapp.com/city/${capitalizedCity}/users`,
    );

    const allUsersResponse = await axios.get(
      'https://bpdts-test-app.herokuapp.com/users',
    );

    const dataSet = [...allUsersResponse.data];
    const filteredData = dataSet.filter((user) => {
      const userCoordinates: [number, number] = [
        parseFloat(user.latitude),
        parseFloat(user.longitude),
      ];
      const distance = this.calculateDistanceInMiles(
        userCoordinates,
        selectedCoordinates,
      );
      if (distance <= inputDistance) {
        return true;
      }
    });
    return [...usersByCityResponse.data, ...filteredData];
  }
  calculateDistanceInMiles([lat1, lon1], [lat2, lon2]) {
    const toRadian = (angle) => (Math.PI / 180) * angle;
    const distance = (a, b) => (Math.PI / 180) * (a - b);
    const RADIUS_OF_EARTH_IN_KM = 6371;

    const dLat = distance(lat2, lat1);
    const dLon = distance(lon2, lon1);

    lat1 = toRadian(lat1);
    lat2 = toRadian(lat2);

    const a =
      Math.pow(Math.sin(dLat / 2), 2) +
      Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.asin(Math.sqrt(a));

    let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

    finalDistance /= 1.60934;

    return finalDistance;
  }
}
