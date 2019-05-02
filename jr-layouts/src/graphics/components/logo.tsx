import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import JrLogo from '../images/banner.png';

const RPGLB_LOGO =
	'https://www.rpglimitbreak.com/assets/images/logo_1200x424.png';
const ROTATE_INTERVAL = 10 * 1000;
const IMAGE_WIDTH = 1920 * 0.1 - 8;
const IMAGE_AREA_HEIGHT = 150;

const images: React.ImgHTMLAttributes<HTMLImageElement>[] = [
	{src: RPGLB_LOGO, width: IMAGE_WIDTH},
	{src: JrLogo, width: IMAGE_WIDTH},
];

const LogoContainer = styled.div`
	height: ${IMAGE_AREA_HEIGHT}px;
	padding: 4px;

	& > div {
		position: absolute;
		height: ${IMAGE_AREA_HEIGHT}px;
		width: ${IMAGE_WIDTH}px;

		& > img {
			position: absolute;
			top: 0;
			bottom: 0;
			margin: auto;
			transition: all 0.5s ease-out;
		}
	}
`;

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
						style={{
							opacity:
								rotateCounter % images.length === index ? 1 : 0,
						}}
					/>
				))}
			</div>
		</LogoContainer>
	);
};
