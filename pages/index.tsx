import { useState, useCallback, useEffect } from 'react'
import { NextPage } from 'next'
import Router from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { io } from 'socket.io-client'

import Game from 'models/Game'
import _createGame from 'lib/createGame'

import styles from 'styles/Home.module.scss'
import GameState from 'models/Game/State'

const Home: NextPage = () => {
	const [games, setGames] = useState<Game[] | null>(null)
	const [isCreateGameLoading, setIsCreateGameLoading] = useState(false)
	
	const createGame = useCallback(async () => {
		try {
			setIsCreateGameLoading(true)
			Router.push(`/${await _createGame()}`)
		} catch ({ message }) {
			setIsCreateGameLoading(false)
			toast.error(message)
		}
	}, [setIsCreateGameLoading])
	
	useEffect(() => {
		const socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/games`, {
			forceNew: true
		})
		
		socket.on('games', setGames)
		
		return () => socket.disconnect()
	}, [setGames])
	
	return (
		<div className={styles.root}>
			<Head>
				<title key="title">follow</title>
			</Head>
			<nav className={styles.navbar}>
				<h1 className={styles.name}>follow</h1>
				<button
					className={styles.createGame}
					disabled={isCreateGameLoading}
					onClick={createGame}
				>
					{isCreateGameLoading ? 'creating...' : 'create game'}
				</button>
			</nav>
			<h2 className={styles.title}>join game</h2>
			<div className={styles.games}>
				{games?.map(game => (
					<Link key={game.id} href={`/${game.id}`}>
						<a className={styles.game}>
							<b>{game.state === GameState.Waiting
								? 'join'
								: 'spectate'
							}</b> {game.id}
						</a>
					</Link>
				))}
			</div>
		</div>
	)
}

export default Home
