import { GAME_ROWS as MAX_Y, GAME_COLUMNS as MAX_X } from 'models/Game'
import Coordinate, { getZeroCoordinate } from 'models/Coordinate'

const wrap = (x: number, max: number) =>
	x < 0 ? x + max : x % max

const onMovement = (setLocation: (location: Coordinate) => void) => {
	const location = getZeroCoordinate()
	const keys = new Set<string>()
	
	const modifyMovement = (key: string, down: boolean) => {
		key = key.toLowerCase()
		
		if (!down) {
			keys.delete(key)
			return
		}
		
		if (keys.has(key))
			return
		
		switch (key) {
			case 'w':
				location.y = wrap(location.y - 1, MAX_Y)
				break
			case 'a':
				location.x = wrap(location.x - 1, MAX_X)
				break
			case 's':
				location.y = wrap(location.y + 1, MAX_Y)
				break
			case 'd':
				location.x = wrap(location.x + 1, MAX_X)
				break
			default:
				return
		}
		
		setLocation(location)
		keys.add(key)
	}
	
	const onKeyDown = ({ key }: KeyboardEvent) =>
		modifyMovement(key, true)
	
	const onKeyUp = ({ key }: KeyboardEvent) =>
		modifyMovement(key, false)
	
	document.addEventListener('keydown', onKeyDown)
	document.addEventListener('keyup', onKeyUp)
	
	return () => {
		document.removeEventListener('keydown', onKeyDown)
		document.removeEventListener('keyup', onKeyUp)
	}
}

export default onMovement
