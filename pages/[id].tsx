import { useState, useCallback, useEffect, Fragment, useRef } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { io, Socket } from 'socket.io-client'
import { toast } from 'react-toastify'

import Game, { GAME_ROWS, GAME_COLUMNS } from 'models/Game'
import GameState from 'models/Game/State'
import User from 'models/User'
import InitialData from 'models/InitialData'
import getId from 'lib/getId'
import onMovement from 'lib/onMovement'
import getUserOnLocation from 'lib/getUserOnLocation'

import styles from 'styles/GamePage.module.scss'

const ROWS = Array.from(new Array(GAME_ROWS))
const COLUMNS = Array.from(new Array(GAME_COLUMNS))

const GamePage: NextPage = () => {
	const socket = useRef<Socket | null>(null)
	
	const router = useRouter()
	const gameId = router.query.id as string | undefined
	
	const [game, setGame] = useState<Game | null>(null)
	const [self, setSelf] = useState<User | null | undefined>()
	
	const [users, setUsers] = useState<User[] | null>(null)
	const [allUsers, setAllUsers] = useState(users)
	
	const didJoin = Boolean(self)
	const isLeader = didJoin && game?.leader === self.id
	const isMovementReady = didJoin && game?.state === GameState.Started
	
	const start = useCallback(() => {
		if (!socket.current)
			return
		
		socket.current.emit('start')
		setGame(game => ({ ...game, state: GameState.Starting }))
	}, [socket, setGame])
	
	useEffect(() => {
		if (!gameId)
			return
		
		socket.current = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/game`, {
			query: { id: getId(), game: gameId },
			forceNew: true
		})
		
		socket.current.on('not-found', () => {
			router.push('/')
			toast.error('Game not found')
		})
		
		socket.current.on('data', ({ game, self }: InitialData) => {
			setGame(game)
			setSelf(self)
		})
		
		socket.current.on('join', (user: User) => {
			toast.info(`${user.color} joined`, {
				style: { background: user.color }
			})
		})
		
		socket.current.on('leave', (user: User) => {
			toast.info(`${user.color} left`, {
				style: { background: user.color }
			})
		})
		
		socket.current.on('start', () => {
			setGame(game => game && ({ ...game, state: GameState.Starting }))
		})
		
		socket.current.on('users', setUsers)
		
		return () => socket.current?.disconnect()
	}, [socket, router, gameId, setGame, setSelf, setUsers])
	
	useEffect(() => {
		if (!isMovementReady)
			return
		
		return onMovement(location => {
			setSelf(self => self && ({ ...self, location }))
			socket.current?.emit('location', location)
		})
	}, [socket, isMovementReady])
	
	useEffect(() => {
		setAllUsers(users && (self
			? [self, ...users].sort((a, b) => b.score - a.score)
			: users
		))
	}, [self, users, setAllUsers])
	
	return (
		<div className={styles.root}>
			<Head>
				<title key="title">
					{self === undefined ? '' : `${self?.color ?? 'spectating'} - `}follow
				</title>
			</Head>
			<div className={styles.grid}>
				{ROWS.map((_row, row) => (
					<Fragment key={row}>
						{COLUMNS.map((_column, column) => (
							<div
								key={column}
								className={styles.cell}
								style={{
									background: allUsers && (
										getUserOnLocation(allUsers, { x: column, y: row })?.color
									)
								}}
							/>
						))}
					</Fragment>
				))}
			</div>
			<header className={styles.header}>
				<p className={styles.status}>
					{game
						? self
							? !isLeader && game.state === GameState.Waiting && 'waiting for leader'
							: 'spectating'
						: null
					}
				</p>
				<div>
					{allUsers?.map((user, index) => (
						<div key={user.id} className={styles.user}>
							<p className={styles.userRank} style={{ background: user.color }}>{index + 1}</p>
							<p className={styles.userName}>{user.color}</p>
							<p className={styles.userScore}>{user.score}</p>
						</div>
					))}
				</div>
			</header>
			{isLeader && game?.state === GameState.Waiting && (
				<button className={styles.start} onClick={start}>start</button>
			)}
		</div>
	)
}

export default GamePage
