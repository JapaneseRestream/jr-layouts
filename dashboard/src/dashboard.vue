<template>
  <div id="container">
    <current-game-controller @edit="loadEdit"></current-game-controller>
    <current-run-info></current-run-info>
    <games-list></games-list>
    <twitch-channel-info></twitch-channel-info>
    <current-run-editor v-if="editorShown"></current-run-editor>
  </div>
</template>

<script>
import currentGameController from './components/current-run-controller.vue'
import currentRunEditor from './components/current-run-editor.vue'
import currentRunInfo from './components/current-run-info.vue'
import gamesList from './components/games-list.vue'
import twitchChannelInfo from './components/twitch-channel-info.vue'

export default {
  components: {
    currentGameController,
    currentRunEditor,
    currentRunInfo,
    gamesList,
    twitchChannelInfo
  },

  data () {
    return {
      editorShown: false
    };
  },

  methods: {
    loadEdit() {
      this.editorShown = true;
    }
  }
}
</script>
