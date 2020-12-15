import { useState, useCallback } from 'react'
import { NextPage } from 'next'
import Router from 'next/router'
import Head from 'next/head'
import { toast } from 'react-toastify'

import _createGame from 'lib/createGame'

import styles from 'styles/Home.module.scss'

const Home: NextPage = () => {
	const [isLoading, setIsLoading] = useState(false)
	
	const createGame = useCallback(async () => {
		try {
			setIsLoading(true)
			Router.push(`/${await _createGame()}`)
		} catch ({ message }) {
			setIsLoading(false)
			toast.error(message)
		}
	}, [setIsLoading])
	
	return (
		<div className={styles.root}>
			<Head>
				<title key="title">follow</title>
			</Head>
			<div className={styles.content}>
				<h1 className={styles.title}>follow</h1>
				<button
					className={styles.createGame}
					disabled={isLoading}
					onClick={createGame}
				>
					create game
				</button>
			</div>
		</div>
	)
}

export default Home
