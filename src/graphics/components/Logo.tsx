import * as React from 'react';
import styled from 'styled-components';

const LogoContainer = styled.div`
	height: 150px;
	padding: 20px 5px 0;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Img = styled.img`
	display: block;
	max-height: 100%;
	max-width: 100%;
	transition: opacity 0.33s linear;
`;

export const Logo = () => (
	<LogoContainer>
		<Img src="https://gamesdonequick.com/static/res/img/gdqlogo.png" />
	</LogoContainer>
);
