import Game from './Game'
import User from './User'

export default interface InitialData {
	game: Game
	self: User | null
}
