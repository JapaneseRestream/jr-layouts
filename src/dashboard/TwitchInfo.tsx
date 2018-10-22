/// <reference path="../../../../types/browser.d.ts" />

import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import {Replicant} from '../../types/bundle';
import {Twitch} from '../../types/schemas/twitch';

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

interface State {
	channelInfo: Twitch['channelInfo'];
}

class App extends React.Component<{}, State> {
	state: State = {
		channelInfo: {
			target: {title: '', game: '', logo: ''},
			ours: {title: '', game: '', logo: ''},
		},
	};

	twitchHandler = (newVal: Twitch) => {
		this.setState({channelInfo: newVal.channelInfo});
	};

	componentDidMount() {
		twitchRep.on('change', this.twitchHandler);
	}

	componentWillUnmount() {
		twitchRep.removeListener('change', this.twitchHandler);
	}

	render() {
		return (
			<Container>
				<InfoContainer>
					<Typography style={{width: '100%', textAlign: 'center'}}>
						ずれていたら更新する→
						<a
							href="https://www.twitch.tv/japanese_restream/dashboard/live"
							target="new"
						>
							Twitchダッシュボード
						</a>
					</Typography>
					<List>
						<ListItem>
							<Avatar src={this.state.channelInfo.target.logo} />
							<ListItemText
								primary={this.state.channelInfo.target.title}
								secondary={this.state.channelInfo.target.game}
							/>
						</ListItem>
						<ListItem>
							<Avatar src={this.state.channelInfo.ours.logo} />
							<ListItemText
								primary={this.state.channelInfo.ours.title}
								secondary={this.state.channelInfo.ours.game}
							/>
						</ListItem>
					</List>
				</InfoContainer>
			</Container>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
