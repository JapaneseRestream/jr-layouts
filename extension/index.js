module.exports = nodecg => {
	require('./schedule')(nodecg);
	require('./current-run')(nodecg);
	require('./twitch')(nodecg);
};
