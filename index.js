const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');

module.exports = class SoundPlugin extends Plugin {
  startPlugin () {
    this._inject();
  }

  pluginWillUnload () {
    uninject('reeee-playSound');
  }

  async _inject () {
    const custom = { call_ringing: {
      url: 'https://canary.discord.com/assets/b9411af07f154a6fef543e7e442e4da9.mp3',
      volume: 0.4
    } };
    const AUDIO = Object.keys(custom).map(s => {
      const sound = custom[s];
      const a = new Audio();
      a.src = sound.url;
      a.volume = sound.volume || 0.4;
      return a;
    });
    const SoundPlayer = await getModule([ 'playSound' ]);
    const play = (type) => {
      if (AUDIO[type]) {
        AUDIO[type].play();
      } else {
        this.log(`${type} was missing from audio cache, loading it manually`);
        const audio = new Audio();
        audio.pause();
        audio.src = custom[type].url;
        audio.volume = 0.1 || custom[type].volume;
        audio.play();
      }
    };
    inject('reeee-playSound', SoundPlayer, 'playSound', e => {
      if (custom[e[0]]) {
        play(e[0]);
        return false;
      }
      return e;
    }, true);
  }
};
