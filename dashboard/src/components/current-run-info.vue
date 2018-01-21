<template>
	<div>
		<div>タイトル: {{game}}</div>
		<div>英語名: {{english}}</div>
		<div>解説: {{commentator}}</div>
		<div>カテゴリー: {{category}}</div>
		<div>機種：{{platform}}</div>
		<div>走者: {{runners}}</div>
	</div>
</template>

<script>
const currentRunRep = nodecg.Replicant('currentRun');

export default {
	data() {
		return {
			game: '',
			english: '',
			commentator: '',
			category: '',
			console: '',
			runners: ''
		};
	},
	created() {
		currentRunRep.on('change', newVal => {
			this.game = newVal.game;
			this.english = newVal.english;
			this.commentator = newVal.commentator;
			this.category = newVal.category;
			this.platform = newVal.console;
			this.runners = newVal.runners;
		});
	}
};</script>
