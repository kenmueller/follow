import GameState from './State'

export const GAME_ROWS = 15
export const GAME_COLUMNS = 25

export default interface Game {
	id: string
	leader: string
	state: GameState
}
