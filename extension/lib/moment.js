const formatDuration = duration => {
	const hours = duration.hours();
	const minutes = String(duration.minutes()).padStart(2, '0');
	const seconds = String(duration.seconds()).padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
};

module.exports = {formatDuration};
