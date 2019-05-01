import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {Spreadsheet} from '../../replicants/spreadsheet';
import {Replicant} from '../../constants';
import {useReplicant} from '../../use-nodecg/use-replicant';

const spreadsheetRep = nodecg.Replicant<Spreadsheet>(Replicant.Spreadsheet);

const Container = styled.div`
	font-size: 20px;
	text-align: center;
	display: flex;
	flex-flow: column nowrap;
`;

const HashtagText = styled.div`
	margin-top: 8px;
	font-family: monospace;
`;

export const Clock: React.FunctionComponent = () => {
	const [time, setTime] = useState('');
	const [spreadsheet] = useReplicant(spreadsheetRep, null);
	useEffect(() => {
		if (!spreadsheet || !spreadsheet.eventInfo) {
			return;
		}
		const TIMEZONE_DIFF_MS =
			spreadsheet.eventInfo.timezoneDifference * 60 * 60 * 1000;
		const intervalTimer = setInterval(() => {
			setTime(
				new Date(Date.now() + TIMEZONE_DIFF_MS).toLocaleString('ja-JP'),
			);
		}, 10);
		return () => {
			clearInterval(intervalTimer);
		};
	}, [spreadsheet]);

	return (
		<Container>
			<div>現地: {time}</div>
			<HashtagText>#RPGLB2019JPR</HashtagText>
		</Container>
	);
};
