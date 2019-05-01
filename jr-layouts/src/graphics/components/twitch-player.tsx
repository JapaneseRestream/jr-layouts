import React, {useState, useEffect} from 'react';
import {useListenFor} from 'use-nodecg';
import styled from 'styled-components';
import {Message} from '../../constants';

const iframeSrc = new URL('https://player.twitch.tv/');
iframeSrc.searchParams.set('channel', 'overwatchleague');
iframeSrc.searchParams.set('autoplay', 'true');
iframeSrc.searchParams.set('muted', 'false');

const PlayerIframe = styled.iframe`
	position: absolute;
	top: 0;
	right: 0;
	width: 90%;
	height: 90%;
`;

export const TwitchPlayer: React.FunctionComponent = () => {
	const [showPlayer, setShowPlayer] = useState(true);
	useListenFor(Message.RefreshPlayer, () => {
		setShowPlayer(false);
	});
	useEffect(() => {
		if (!showPlayer) {
			setShowPlayer(true);
		}
	}, [showPlayer]);

	if (!showPlayer) {
		return null;
	}

	return (
		<PlayerIframe
			src={iframeSrc.href}
			height={1080 * 0.9}
			width={1920 * 0.9}
			frameBorder={0}
			scrolling='no'
		/>
	);
};
