import { useState, useCallback, useEffect, Fragment, useRef } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { io as IO, Socket } from 'socket.io-client'
import { toast } from 'react-toastify'

import Game, { GAME_ROWS, GAME_COLUMNS } from 'models/Game'
import User from 'models/User'
import InitialData from 'models/InitialData'
import getId from 'lib/getId'
import getUserOnLocation from 'lib/getUserOnLocation'

import styles from 'styles/GamePage.module.scss'

const ROWS = Array.from(new Array(GAME_ROWS))
const COLUMNS = Array.from(new Array(GAME_COLUMNS))

const GamePage: NextPage = () => {
	const io = useRef<Socket | null>(null)
	
	const router = useRouter()
	const gameId = router.query.id as string | undefined
	
	const [game, setGame] = useState<Game | null>(null)
	const [self, setSelf] = useState<User | null | undefined>()
	
	const [users, setUsers] = useState<User[] | null>(null)
	
	const isLeader = game && game.leader === self?.id
	const didStart = game?.started ?? false
	
	const start = useCallback(() => {
		if (!io.current)
			return
		
		io.current.emit('start')
		setGame(game => ({ ...game, started: true }))
	}, [io, setGame])
	
	useEffect(() => {
		if (!gameId)
			return
		
		io.current = IO(process.env.NEXT_PUBLIC_API_BASE_URL, {
			query: { id: getId(), game: gameId }
		})
		
		io.current.on('not-found', () => {
			router.push('/')
			toast.error('Game not found')
		})
		
		io.current.on('data', ({ game, self }: InitialData) => {
			setGame(game)
			setSelf(self)
		})
		
		io.current.on('join', (user: User) => {
			toast.info(`${user.color} joined`, {
				style: { background: user.color }
			})
		})
		
		io.current.on('leave', (user: User) => {
			toast.info(`${user.color} left`, {
				style: { background: user.color }
			})
		})
		
		io.current.on('start', () => {
			setGame(game => ({ ...game, started: true }))
		})
		
		io.current.on('users', setUsers)
		
		return () => io.current?.disconnect()
	}, [io, router, gameId, setGame, setSelf, setUsers])
	
	return (
		<div className={styles.root}>
			<Head>
				<link key="api-preconnect" rel="preconnect" href={process.env.NEXT_PUBLIC_API_BASE_URL} />
			</Head>
			<div className={styles.grid}>
				{ROWS.map((_row, row) => (
					<Fragment key={row}>
						{COLUMNS.map((_column, column) => (
							<div
								key={column}
								className={styles.cell}
								style={{ background: users && getUserOnLocation(users, { x: column, y: row })?.color }}
							/>
						))}
					</Fragment>
				))}
			</div>
			<header className={styles.header}>
				<p className={styles.users}>
					{users && <>{users.length + 1} player{users.length ? 's' : ''}</>}
				</p>
				<p className={styles.status}>
					{game
						? self
							? isLeader
								? 'leader'
								: !didStart && 'waiting for leader'
							: 'spectating'
						: null
					}
				</p>
			</header>
			{isLeader && !didStart && (
				<button className={styles.start} onClick={start}>
					start
				</button>
			)}
		</div>
	)
}

export default GamePage
