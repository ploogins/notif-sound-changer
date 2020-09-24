const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');
const Settings = require('./Settings');
const playing = {};
module.exports = class SoundPlugin extends Plugin {
  startPlugin () {
    powercord.api.settings.registerSettings('notifSounds', {
      category: 'notifSounds',
      label: 'Notification Sounds',
      render: Settings
    });
    this.loadStylesheet('style.scss');
    this._inject();
  }

  pluginWillUnload () {
    uninject('reeee-playSound');
    uninject('reeee-createSound');
    uninject('reeee-audio');
    powercord.api.settings.unregisterSettings('notifSounds');
  }

  async _inject () {
    /*
     * const this.custom = { call_ringing: {
     *   url: 'https://canary.discord.com/assets/b9411af07f154a6fef543e7e442e4da9.mp3',
     *   volume: 0.4
     * } };
     */
    const SoundPlayer = await getModule([ 'playSound' ]);
    const CreateSound = await getModule([ 'createSound' ]);
    const CallHandler = await getModule([ 'handleRingUpdate' ]);
    const getCurrentUser = await getModule([ 'getCurrentUser' ]);
    const { getCalls } = await getModule([ 'getCalls' ]);
    const play = (type) => {
      const audio = new Audio();
      audio.pause();
      audio.src = this.custom[type].url;
      audio.volume = this.custom[type].volume ?? 0.5;
      audio.play();
    };
    const playOnce = (type) => {
      if (playing[type]) {
        return;
      }
      const audio = new Audio();
      audio.pause();
      audio.src = this.custom[type].url;
      audio.loop = true;
      audio.volume = this.custom[type].volume ?? 0.5;
      audio.play();
      playing[type] = audio;
    };
    inject('reeee-playSound', SoundPlayer, 'playSound', (e) => {
      this.custom = this.settings.get('notifsounds', {});
      if (this.custom[e[0]] && this.custom[e[0]].url) {
        play(e[0]);
        return false;
      }
      return e;
    }, true);
    inject('reeee-createSound', CreateSound, 'createSound', (e) => {
      this.custom = this.settings.get('notifsounds', {});
      if (this.custom[e[0]] && this.custom[e[0]].url) {
        play(e[0]);
        return [ '' ]; // workaround to prevent errors
      }
      return e;
    }, true);

    CallHandler.terminate();
    inject('reeee-audio', CallHandler, 'handleRingUpdate', (e) => {
      this.custom = this.settings.get('notifsounds', {}, false);
      const call = getCalls().filter((x) => x.ringing.length > 0);
      if (call[0]) {
        if (call[0].ringing[0] === getCurrentUser.getCurrentUser().id && this.custom.call_ringing) {
          playOnce('call_ringing');
          return false;
        }
        if (this.custom.call_calling) {
          playOnce('call_calling');
          return false;
        }
      }
      if (playing.call_ringing) {
        playing.call_ringing.pause();
        delete playing.call_ringing;
      }
      if (playing.call_calling) {
        playing.call_calling.pause();
        delete playing.call_calling;
      }
      return e;
    }, true);
    CallHandler.initialize();
  }
};
