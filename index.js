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

  reload (sounds) {
    console.log('reload', sounds);
    uninject('reeee-playSound');
    uninject('reeee-createSound');
    uninject('reeee-audio');
    this.settings.set('notifsounds', sounds);
    this._inject(sounds);
  }

  async _inject (sounds) {
    /*
     * const custom = { call_ringing: {
     *   url: 'https://canary.discord.com/assets/b9411af07f154a6fef543e7e442e4da9.mp3',
     *   volume: 0.4
     * } };
     */
    let custom;
    if (sounds) {
      custom = sounds;
    }
    if (!custom) {
      custom = await this.settings.get('notifsounds');
    }
    if (custom) {
      const SoundPlayer = await getModule([ 'playSound' ]);
      const CreateSound = await getModule([ 'createSound' ]);
      const CallHandler = await getModule([ 'handleRingUpdate' ]);
      const getCurrentUser = await getModule([ 'getCurrentUser' ]);
      const { getCalls } = await getModule([ 'getCalls' ]);
      const play = (type) => {
        const audio = new Audio();
        audio.pause();
        audio.src = custom[type].url;
        audio.volume = 0.1 || custom[type].volume;
        audio.play();
      };
      const playOnce = (type) => {
        if (playing[type]) {
          return;
        }
        const audio = new Audio();
        audio.pause();
        audio.src = custom[type].url;
        audio.loop = true;
        audio.volume = 0.4 || custom[type].volume;
        audio.play();
        /*
         * if (playing.call_ringing) {
         *   playing.call_ringing.pause();
         * }
         */
        playing[type] = audio;
      };
      inject('reeee-playSound', SoundPlayer, 'playSound', e => {
        console.log(e);
        if (custom[e[0]] && custom[e[0]].url !== '') {
          play(e[0]);
          return false;
        }
        return e;
      }, true);
      inject('reeee-createSound', CreateSound, 'createSound', e => {
        console.log(e);
        if (custom[e[0]] && custom[e[0]].url !== '') {
          play(e[0]);
          return [ '' ];
        }
        return e;
      }, true);

      CallHandler.terminate();
      // const debouncedPlay = global._.debounce(play, 100);
      inject('reeee-audio', CallHandler, 'handleRingUpdate', e => {
        console.log(e);
        const call = getCalls().filter((x) => x.ringing.length > 0);
        if (call[0]) {
          if (call[0].ringing[0] === getCurrentUser.getCurrentUser().id && custom.call_ringing) {
            playOnce('call_ringing');
            return false;
          }
          if (custom.call_calling) {
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

      console.log(custom);
      CallHandler.initialize();
    }
  }
};
