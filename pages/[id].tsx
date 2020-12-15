import { useState, useEffect, Fragment } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { io as IO } from 'socket.io-client'
import { toast } from 'react-toastify'

import { GAME_COLUMNS, GAME_ROWS } from 'models/Game'
import User from 'models/User'
import InitialData from 'models/InitialData'
import getId from 'lib/getId'

import styles from 'styles/GamePage.module.scss'

const ROWS = Array.from(new Array(GAME_ROWS))
const COLUMNS = Array.from(new Array(GAME_COLUMNS))

const GamePage: NextPage = () => {
	const router = useRouter()
	const gameId = router.query.id as string | undefined
	
	const [users, setUsers] = useState<User[] | null>(null)
	
	useEffect(() => {
		if (!gameId)
			return
		
		const io = IO(process.env.NEXT_PUBLIC_API_BASE_URL, {
			query: { id: getId(), game: gameId }
		})
		
		io.on('not-found', () => {
			router.push('/')
			toast.error('Game not found')
		})
		
		io.on('data', ({ game, self }: InitialData) => {
			console.log(game, self)
		})
		
		io.on('users', setUsers)
	}, [router, gameId, setUsers])
	
	return (
		<div className={styles.root}>
			<Head>
				<link key="api-preconnect" rel="preconnect" href={process.env.NEXT_PUBLIC_API_BASE_URL} />
			</Head>
			<div className={styles.grid}>
				{ROWS.map((_row, row) => (
					<Fragment key={row}>
						{COLUMNS.map((_column, column) => (
							<div key={column} className={styles.cell} />
						))}
					</Fragment>
				))}
			</div>
		</div>
	)
}

export default GamePage
