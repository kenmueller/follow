import { useState, useEffect, Fragment } from 'react'
import { NextPage } from 'next'
import Router from 'next/router'

import { GAME_COLUMNS, GAME_ROWS } from 'models/Game'
import User from 'models/User'

import styles from 'styles/GamePage.module.scss'

const ROWS = Array.from(new Array(GAME_ROWS))
const COLUMNS = Array.from(new Array(GAME_COLUMNS))

const GamePage: NextPage = () => {
	const [users, setUsers] = useState<User[] | null>(null)
	
	useEffect(() => {
		
	}, [])
	
	return (
		<div className={styles.root}>
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
