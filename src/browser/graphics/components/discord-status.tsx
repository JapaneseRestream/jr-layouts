import React from 'react';
import styled from 'styled-components';

import {useReplicant} from '../../shared/use-nodecg/use-replicant';
import DiscordLogo from '../../shared/images/discord-logo-white.png';

import {FitText} from './fit-text';

const MAX_NAMES = 6;

const speakingStatusRep = nodecg.Replicant('discordSpeakingStatus');

const Container = styled.div`
	margin-top: 8px;
	padding: 4px;
	flex: 1;
	display: flex;
	flex-flow: column nowrap;
	text-align: center;
	font-size: 20px;
`;

const DiscordLogoImage = styled.img`
	width: 30%;
`;

export const DiscordStatus: React.FunctionComponent = () => {
	const [speakingStatus] = useReplicant(speakingStatusRep);

	if (!speakingStatus) {
		return null;
	}

	const filteredSpeakingMembers = speakingStatus.slice(0, MAX_NAMES);

	return (
		<Container>
			<div>
				<DiscordLogoImage src={DiscordLogo} />
			</div>
			{filteredSpeakingMembers.map((speakingMember) => (
				<FitText key={speakingMember.id} text={speakingMember.name} />
			))}
		</Container>
	);
};
