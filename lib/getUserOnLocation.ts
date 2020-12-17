import User from 'models/User'
import Coordinate, { areCoordinatesEqual } from 'models/Coordinate'

const getUserOnLocation = (users: User[], location: Coordinate) =>
	users.find(user => areCoordinatesEqual(user.location, location))

export default getUserOnLocation
