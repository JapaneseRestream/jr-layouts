<template>
	<div>
		<paper-button raised @click="previousRun">
			前のゲーム
		</paper-button>
		<paper-button raised @click="loadEdit">編集</paper-button>
		<paper-button raised @click="nextRun">次のゲーム</paper-button>
	</div>
</template>

<script>
export default {
  methods: {
	  previousRun() {
		  nodecg.sendMessage('previousRun');
	  },
	  nextRun() {
			nodecg.sendMessage('nextRun');
		},
		loadEdit() {
			this.$emit('edit')
		}
  }
}
</script>
