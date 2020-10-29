import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

import {useReplicant} from '../../shared/use-nodecg/use-replicant';

const targetChannelRep = nodecg.Replicant('targetChannel');

const PlayerIframe = styled.iframe`
	position: absolute;
	top: 0;
	right: 0;
	width: 90%;
	height: 90%;
`;

export const TwitchPlayer: React.FunctionComponent = () => {
	const [showPlayer, setShowPlayer] = useState(true);
	const [targetChannel] = useReplicant(targetChannelRep);

	useEffect(() => {
		const handler = () => {
			setShowPlayer(false);
		};
		nodecg.listenFor('refreshPlayer', handler);
		return () => {
			nodecg.unlisten('refreshPlayer', handler);
		};
	}, []);
	useEffect(() => {
		if (!showPlayer) {
			setShowPlayer(true);
		}
	}, [showPlayer]);

	if (!showPlayer || !targetChannel) {
		return null;
	}

	const iframeSrc = new URL('https://player.twitch.tv/');
	iframeSrc.searchParams.set('volume', '1');
	iframeSrc.searchParams.set('muted', 'false');
	iframeSrc.searchParams.set('channel', targetChannel);
	iframeSrc.searchParams.set('parent', location.host);
	iframeSrc.searchParams.set('player', 'popout');

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
