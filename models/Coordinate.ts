export default interface Coordinate {
	x: number
	y: number
}

export const areCoordinatesEqual = (a: Coordinate, b: Coordinate) =>
	a.x === b.x && a.y === b.y
