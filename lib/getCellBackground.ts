import GameState from 'models/Game/State'
import User from 'models/User'
import Coordinate, { areCoordinatesEqual } from 'models/Coordinate'

export interface GetCellBackgroundOptions {
	row: number
	column: number
	state: GameState | null
	luckyCells: Coordinate[] | null
	luckyCellIndex: number | null
	users: User[] | null
}

const getCellBackground = ({ row, column, state, luckyCells, luckyCellIndex, users }: GetCellBackgroundOptions) => {
	const location: Coordinate = { x: column, y: row }
	
	if (state === GameState.Starting && luckyCells && luckyCellIndex !== null) {
		const luckyCell = luckyCells[luckyCellIndex]
		
		if (areCoordinatesEqual(luckyCell, location))
			return '#ec407a'
	}
	
	return users
		?.find(user => areCoordinatesEqual(user.location, location))
		?.color
}

export default getCellBackground
