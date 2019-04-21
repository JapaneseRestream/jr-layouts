import {
	Avatar,
	List,
	ListItem,
	ListItemText,
	Typography,
} from '@material-ui/core';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import {Replicant} from '../constants';
import {Twitch} from '../replicants/twitch';
import {useReplicant} from '../use-nodecg/use-replicant';

const twitchRep = nodecg.Replicant<Twitch>(Replicant.Twitch);

const Container = styled.div`
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: center;
`;

const InfoContainer = styled.div`
	width: 100vw;
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: flex-start;
`;

const App: React.FunctionComponent = () => {
	const [twitch] = useReplicant(twitchRep, null);
	if (!twitch) {
		return null;
	}
	return (
		<Container>
			<InfoContainer>
				<Typography style={{width: '100%', textAlign: 'center'}}>
					ずれていたら更新する→
					<a
						href={`https://www.twitch.tv/japanese_restream/dashboard/live`}
						target='new'
					>
						Twitchダッシュボード
					</a>
				</Typography>
				<List>
					<ListItem>
						<Avatar src={twitch.channelInfo.target.logo} />
						<ListItemText
							primary={twitch.channelInfo.target.title}
							secondary={twitch.channelInfo.target.game}
						/>
					</ListItem>
					<ListItem>
						<Avatar src={twitch.channelInfo.ours.logo} />
						<ListItemText
							primary={twitch.channelInfo.ours.title}
							secondary={twitch.channelInfo.ours.game}
						/>
					</ListItem>
				</List>
			</InfoContainer>
		</Container>
	);
};

ReactDOM.render(<App />, document.querySelector('#app'));
