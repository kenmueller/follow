import { useRef, useState, useMemo, useCallback, useEffect, Fragment } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { io, Socket } from 'socket.io-client'
import { toast } from 'react-toastify'
import cx from 'classnames'

import Game, { LUCKY_CELL_TIME, GAME_ROWS, GAME_COLUMNS } from 'models/Game'
import GameState from 'models/Game/State'
import User from 'models/User'
import InitialData from 'models/InitialData'
import Coordinate from 'models/Coordinate'
import getId from 'lib/getId'
import onMovement from 'lib/onMovement'
import getCellBackground from 'lib/getCellBackground'

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
	
	const [luckyCells, setLuckyCells] = useState<Coordinate[] | null>(null)
	const [luckyCellIndex, setLuckyCellIndex] = useState<number | null>(null)
	
	const didJoin = Boolean(self)
	const state = game && game.state
	const isLeader = didJoin && game?.leader === self.id
	const isMovementReady = didJoin && state === GameState.Started
	
	const luckyCellCount = luckyCells && luckyCells.length
	
	const status = useMemo(() => {
		switch (state) {
			case null:
				return null
			case GameState.Waiting:
				return isLeader ? null : 'waiting for leader'
			case GameState.Starting:
				return luckyCellCount === null || luckyCellIndex === null
					? null
					: `${(luckyCellCount - luckyCellIndex) * LUCKY_CELL_TIME / 1000}s`
			case GameState.Started:
				return didJoin ? 'go!' : 'spectating'
		}
	}, [state, didJoin, isLeader, luckyCellCount, luckyCellIndex])
	
	const start = useCallback(() => {
		socket.current?.emit('start')
	}, [socket])
	
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
		
		socket.current.on('starting', (luckyCells: Coordinate[]) => {
			setGame(game => game && ({ ...game, state: GameState.Starting }))
			setLuckyCells(luckyCells)
		})
		
		socket.current.on('started', () => {
			setGame(game => game && ({ ...game, state: GameState.Started }))
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
	
	useEffect(() => {
		if (luckyCellCount === null)
			return
		
		setLuckyCellIndex(0)
		
		const interval = setInterval(() => {
			setLuckyCellIndex(index => {
				if (index === null)
					return null
				
				const newIndex = index + 1
				
				if (newIndex >= luckyCellCount) {
					clearInterval(interval)
					return null
				}
				
				return newIndex
			})
		}, LUCKY_CELL_TIME)
		
		return () => clearInterval(interval)
	}, [luckyCellCount, setLuckyCellIndex])
	
	return (
		<div className={styles.root}>
			<Head>
				<title key="title">
					{self === undefined ? '' : `${self?.color ?? 'spectating'} - `}follow
				</title>
			</Head>
			<div className={cx(styles.grid, { [styles.starting]: state === GameState.Starting })}>
				{ROWS.map((_row, row) => (
					<Fragment key={row}>
						{COLUMNS.map((_column, column) => (
							<div
								key={column}
								style={{
									background: getCellBackground({
										row,
										column,
										state,
										luckyCells,
										luckyCellIndex,
										users: allUsers
									})
								}}
							/>
						))}
					</Fragment>
				))}
			</div>
			<header className={styles.header}>
				<p>{status}</p>
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
			{isLeader && state === GameState.Waiting && (
				<button className={styles.start} onClick={start}>start</button>
			)}
		</div>
	)
}

export default GamePage
