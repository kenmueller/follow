import { nanoid } from 'nanoid'

const getId = () => {
	const existingId = localStorage.getItem('id')
	
	if (existingId)
		return existingId
	
	const newId = nanoid()
	
	localStorage.setItem('id', newId)
	return newId
}

export default getId
