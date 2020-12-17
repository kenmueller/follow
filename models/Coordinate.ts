export default interface Coordinate {
	x: number
	y: number
}

export const getZeroCoordinate = (): Coordinate =>
	({ x: 0, y: 0 })

export const areCoordinatesEqual = (a: Coordinate, b: Coordinate) =>
	a.x === b.x && a.y === b.y
