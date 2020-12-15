import Coordinates from './Coordinates'

export default interface User {
	id: string
	color: string
	score: number
	location: Coordinates
}
