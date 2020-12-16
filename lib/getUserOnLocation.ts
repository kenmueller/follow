import User from 'models/User'
import Coordinate, { areCoordinatesEqual } from 'models/Coordinate'

const getUserOnLocation = (users: User[], location: Coordinate) => {
	for (let i = users.length - 1; i >= 0; i--) {
		const user = users[i]
		
		if (areCoordinatesEqual(user.location, location))
			return user
	}
	
	return null
}

export default getUserOnLocation
