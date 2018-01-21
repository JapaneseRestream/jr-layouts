<template>
	<prism-table id="table"
	responsive
	condensed>
		<prism-thead>
			<prism-tr>
				<prism-th></prism-th>
				<prism-th>開始予定</prism-th>
				<prism-th>タイトル</prism-th>
				<prism-th>カテゴリー</prism-th>
				<prism-th>走者</prism-th>
			</prism-tr>
		</prism-thead>
		<prism-tbody v-for="run in schedule" :key="run.pk">
			<prism-tr>
				<prism-td>
					<paper-button raised @click="selectRun(run.index)">選択</paper-button>
				</prism-td>
				<prism-td>{{unixTimeToString(run.scheduled)}}</prism-td>
				<prism-td>{{run.game}}</prism-td>
				<prism-td>{{run.category}}</prism-td>
				<prism-td>{{run.runners}}</prism-td>
				<prism-td v-if="currentRunIndex === run.index">★</prism-td>
			</prism-tr>
		</prism-tbody>
	</prism-table>
</template>

<script>
const scheduleRep = nodecg.Replicant('schedule');
const currentRunRep = nodecg.Replicant('currentRun');

export default {
	data() {
		return {
			schedule: [],
			currentRunIndex: null
		};
	},
	created() {
		scheduleRep.on('change', newVal => {
			this.schedule = newVal;
		});
		currentRunRep.on('change', newVal => {
			this.currentRunIndex = newVal.index;
		});
	},
	methods: {
		unixTimeToString(unix) {
			return new Date(unix).toLocaleString();
		},
		selectRun(index) {
			nodecg.sendMessage('specificRun', index);
		}
	}
};</script>
