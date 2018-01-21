<template>
	<div>
		<div id="container">
			<current-run-controller id="controller"
			@edit="loadEdit"/>
			<current-run-info id="run-info"/>
			<games-list id="list"/>
			<twitch-channel-info id="channel"/>
		</div>
		<current-run-editor id="editor"
		ref="editor"/>
	</div>
</template>

<style scoped>
#container {
	height: 100vh;
	display: grid;
	grid-template: auto 1fr / repeat(2, auto) 1fr;
}

#controller {
	grid-row: 1 / 2;
	grid-column: 1 / 2;
}

#run-info {
	grid-row: 2 / 3;
	grid-column: 1 / 2;
}

#list {
	grid-row: 3 / 4;
	grid-column: 1 / 3;
}

#channel-info {
	grid-row: 1 / 3;
	grid-column: 2 / 3;
}

#editor {
	width: 70vw;
}
</style>


<script>
import currentRunController from './components/current-run-controller.vue';
import currentRunEditor from './components/current-run-editor.vue';
import currentRunInfo from './components/current-run-info.vue';
import gamesList from './components/games-list.vue';
import twitchChannelInfo from './components/twitch-channel-info.vue';

export default {
	components: {
		currentRunController,
		currentRunEditor,
		currentRunInfo,
		gamesList,
		twitchChannelInfo
	},

	methods: {
		loadEdit() {
			this.$refs.editor.open();
		}
	}
};</script>
