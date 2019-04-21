import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

const TIMEZONE_DIFF_MS = 14 * 60 * 60 * 1000;

const Container = styled.div`
	font-size: 20px;
	text-align: center;
`;

export const Clock: React.FunctionComponent = () => {
	const [time, setTime] = useState('');
	useEffect(() => {
		const intervalTimer = setInterval(() => {
			setTime(
				new Date(Date.now() - TIMEZONE_DIFF_MS).toLocaleString('ja-JP'),
			);
		}, 10);
		return () => {
			clearInterval(intervalTimer);
		};
	}, []);

	return (
		<Container>
			現地: {time}
			<br />
			<br />
			#RPGLB2019JPR
		</Container>
	);
};
