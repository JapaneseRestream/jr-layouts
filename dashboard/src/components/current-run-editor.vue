<template>
	<paper-dialog ref="dialog">
		<paper-input
		label="ゲーム"
		name="game"
		always-float-label
		:value="editingRun.game"
		@input="updateValue"></paper-input>
		<paper-input
		label="解説"
		name="commentator"
		always-float-label
		:value="editingRun.commentator"
		@input="updateValue"></paper-input>
		<paper-input
		label="カテゴリー"
		name="category"
		always-float-label
		:value="editingRun.category"
		@input="updateValue"></paper-input>
		<paper-input
		label="機種"
		name="console"
		always-float-label
		:value="editingRun.console"
		@input="updateValue"></paper-input>
		<paper-input
		label="走者"
		name="runners"
		always-float-label
		:value="editingRun.runners"
		@input="updateValue"></paper-input>

		<paper-button
		raised
		@click="save">保存</paper-button>
		<paper-button
		raised
		dialog-dismiss
		autofocus>キャンセル</paper-button>
	</paper-dialog>
</template>

<script>
import clone from 'clone'
const currentRunRep = nodecg.Replicant('currentRun');

export default {
	data () {
		return {
			editingRun: {
				game: null,
				commentator: null,
				category: null,
				console: null,
				runners: null,
			}
		};
	},
	created() {
		currentRunRep.on('change', newVal => {
			this.editingRun = clone(newVal);
		});
	},
	methods: {
		open() {
			this.$refs.dialog.open();
		},
		save() {
			nodecg.sendMessage('editRun', this.editingRun, () => {
				this.$refs.dialog.close();
			});
		},
		updateValue({target: {name, value}}) {
			this.editingRun[name] = value
		}
	}
}</script>
