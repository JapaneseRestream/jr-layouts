<template>
	<div>
		<div>
			チャンネル情報（ずれてたら<a target="_blank" href="https://www.twitch.tv/japanese_restream/dashboard">ここ</a>で直す！）
		</div>
		<div>JRチャンネル: {{ourChannelInfoGame}}</div>
		<div>GDQチャンネル: {{targetChannelInfoGame}}</div>
	</div>
</template>

<script>
const targetChannelInfoRep = nodecg.Replicant('targetChannelInfo');
const ourChannelInfoRep = nodecg.Replicant('ourChannelInfo');

export default {
	data () {
		return {
			targetChannelInfoGame: null,
			ourChannelInfoGame: null
		}
	},
	created () {
		targetChannelInfoRep.on('change', newVal => {
			this.targetChannelInfoGame = newVal.game;
		});
		ourChannelInfoRep.on('change', newVal => {
			this.ourChannelInfoGame = newVal.game;
		});
	}
}</script>
