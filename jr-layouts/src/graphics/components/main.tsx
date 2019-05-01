import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useListenFor} from 'use-nodecg';
import {Message} from '../../constants';
import {Left} from './left';
import {RunInfo} from './run-info';

const Container = styled.div`
	position: absolute;
	width: 1920px;
	height: 1080px;
	overflow: hidden;
`;

const TwitchPlayer = styled.iframe`
	position: absolute;
	top: 0;
	right: 0;
	width: 90%;
	height: 90%;
`;

const iframeSrc = new URL('https://player.twitch.tv/');
iframeSrc.searchParams.set('channel', 'overwatchleague');
iframeSrc.searchParams.set('autoplay', 'true');
iframeSrc.searchParams.set('muted', 'false');

export const Main: React.FunctionComponent = () => {
	const [showPlayer, setShowPlayer] = useState(true);
	useListenFor(Message.RefreshPlayer, () => {
		setShowPlayer(false);
	});
	useEffect(() => {
		if (!showPlayer) {
			setShowPlayer(true);
		}
	}, [showPlayer]);
	return (
		<Container>
			<Left />
			<RunInfo />
			{showPlayer && (
				<TwitchPlayer
					src={iframeSrc.href}
					height={1080 * 0.9}
					width={1920 * 0.9}
					frameBorder={0}
					scrolling='no'
				/>
			)}
		</Container>
	);
};
