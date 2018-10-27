import * as React from 'react';
import styled from 'styled-components';
import JrLogo from '../images/banner.png';

const GDQ_LOGO = 'https://gamesdonequick.com/static/res/img/gdqlogo.png';
const ROTATE_INTERVAL = 10 * 1000;

const images: Array<React.ImgHTMLAttributes<HTMLImageElement>> = [
	{src: JrLogo, width: 230},
	{src: GDQ_LOGO, width: 230},
];

const LogoContainer = styled.div`
	height: 150px;

	& > div {
		position: absolute;
		height: 150px;
		width: 230px;

		& > img {
			position: absolute;
			top: 0;
			bottom: 0;
			margin: auto;
			transition: all 0.5s ease-out;
		}
	}
`;

const showStyle: React.CSSProperties = {
	opacity: 1,
};

const hiddenStyle: React.CSSProperties = {
	opacity: 0,
};

interface State {
	rotateCounter: number;
}

export class Logo extends React.Component<{}, State> {
	state: State = {rotateCounter: 0};
	private rotateTimer?: NodeJS.Timer;

	componentDidMount() {
		this.rotateTimer = setInterval(() => {
			this.setState(state => ({rotateCounter: state.rotateCounter + 1}));
		}, ROTATE_INTERVAL);
	}
	componentWillUnmount() {
		if (this.rotateTimer) {
			clearInterval(this.rotateTimer);
		}
	}

	render() {
		return (
			<LogoContainer>
				<div>
					{images.map((image, index) => (
						<img
							{...image}
							key={image.src}
							style={
								this.state.rotateCounter %
								images.length ===
								index
									? showStyle
									: hiddenStyle
							}
						/>
					))}
				</div>
			</LogoContainer>
		);
	}
}
