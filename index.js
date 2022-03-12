const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');
const Settings = require('./Settings');
const playing = {};
module.exports = class NotificationSounds extends Plugin {
  startPlugin () {
    powercord.api.settings.registerSettings('notif-sound-changer', {
      category: 'notif-sound-changer',
      label: 'Notification Sounds',
      render: Settings
    });
    this.loadStylesheet('style.scss');
    this._inject();
  }

  pluginWillUnload () {
    uninject('ns-playSound');
    uninject('ns-createSound');
    uninject('ns-call');
    uninject('ns-isDisabled');
    uninject('ns-showNotificationPre');
    uninject('ns-showNotificationPost');
    powercord.api.settings.unregisterSettings('notif-sound-changer');
  }

  async _inject () {
    /*
     * const this.custom = { call_ringing: {
     *   url: 'https://canary.discord.com/assets/b9411af07f154a6fef543e7e442e4da9.mp3',
     *   volume: 0.4
     * } };
     */
    const SoundPlayer = await getModule([ 'playSound' ]);
    const CallHandler = await getModule([ 'handleRingUpdate' ]);
    const isDisabled = await getModule([ 'isSoundDisabled' ]);
    const getCurrentUser = await getModule([ 'getCurrentUser' ]);
    const { getCalls } = await getModule([ 'getCalls' ]);
    const showNotification = await getModule([ 'showNotification' ]);

    const settings = powercord.api.settings.buildCategoryObject('notif-sound-changer'); // This fixes... quite a lot for whatever reason

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

    inject('ns-playSound', SoundPlayer, 'playSound', (e) => {
      this.custom = settings.get('notifsounds', false);
      //console.log(e);
      if (this.custom[e[0]] && this.custom[e[0]].url) {
        play(e[0]);
        return false;
      }
      return e;
    }, true);

    // Temporary and ungodly workaround for message notifications not playing

    // Prevent message sounds from playing by overwriting the 4th argument.
    inject('ns-showNotificationPre', showNotification, 'showNotification', (args) => {
      if (args.length >= 4) {
        const info = args[3];
        if (info.sound.startsWith('message') && this.custom['message1']) {
          return [ args[0], args[1], args[2], Object.assign(info, { playSoundIfDisabled: false, sound: null, isReplacedByNSC: true }) ];
        }
      }

      return args;
    }, true);

    // Now play the sound provided by NSC.
    inject('ns-showNotificationPost', showNotification, 'showNotification', (args, res) => {
      if (args.length >= 4) {
        const info = args[3];
        if (info.sound == null && info.isReplacedByNSC) {
          play('message1');
        }
      }

      return res;
    }, false);

    CallHandler.terminate();
    /*
     * inject('ns-call-reset', CallHandler, 'handleRingUpdate', (_, e) => {
     *   console.log(_, e);
     *   return false;
     * }, false);
     */
    inject('ns-call', CallHandler, 'handleRingUpdate', (e) => {
      this.custom = settings.get('notifsounds', false);
      const call = getCalls().filter((x) => x.ringing.length > 0);
      if (call[0]) {
        if (call[0].ringing[0] === getCurrentUser.getCurrentUser().id && this.custom.call_ringing) {
          playOnce('call_ringing');
          return e;
        }
        if (this.custom.call_calling) {
          playOnce('call_calling');
          return e;
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

    inject('ns-isDisabled', isDisabled, 'isSoundDisabled', (e, r) => {
      if ((e[0] === 'call_calling' || e[0] === 'call_ringing') && this.custom[e[0]]) {
        return true;
      }
      return r;
    }, false);

    CallHandler.initialize();
  }
};
