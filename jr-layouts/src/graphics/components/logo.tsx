import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import JrLogo from '../images/banner.png';

const GDQ_LOGO = 'https://gamesdonequick.com/static/res/img/gdqlogo.png';
const ROTATE_INTERVAL = 10 * 1000;

const images: React.ImgHTMLAttributes<HTMLImageElement>[] = [
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

export const Logo: React.FunctionComponent = () => {
	const [rotateCounter, setRotateCounter] = useState(0);
	useEffect(() => {
		const intervalTimer = setInterval(() => {
			setRotateCounter((oldCounter) => oldCounter + 1);
		}, ROTATE_INTERVAL);
		return () => {
			clearInterval(intervalTimer);
		};
	}, []);

	return (
		<LogoContainer>
			<div>
				{images.map((image, index) => (
					<img
						{...image}
						key={image.src}
						style={
							rotateCounter % images.length === index
								? showStyle
								: hiddenStyle
						}
					/>
				))}
			</div>
		</LogoContainer>
	);
};
