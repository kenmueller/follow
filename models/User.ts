import Coordinate from './Coordinate'

export default interface User {
	id: string
	color: string
	score: number
	location: Coordinate
}
