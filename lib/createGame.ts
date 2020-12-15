import getId from './getId'

const createGame = async () => {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/games`, {
		method: 'POST',
		headers: { Authorization: getId() }
	})
	const text = await response.text()
	
	if (response.ok)
		return text
	
	throw new Error(text)
}

export default createGame
