const { React } = require('powercord/webpack');
const { getModule, getModuleByDisplayName } = require('powercord/webpack');
const { TextInput, SliderInput } = require('powercord/components/settings');
const path = require('path');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    const get = props.getSetting;
    this.state = {
      notifsounds: get('notifsounds') || {},
      playing: {}
    };
  }

  async componentDidMount () {
    this.setState({
      VerticalScroller: (await getModule([ 'AdvancedScrollerThin' ])).AdvancedScrollerThin,
      Text: await getModuleByDisplayName('Text'),
      playSound: (await getModule([ 'playSound' ])).playSound
    });
  }

  render () {
    if (!this.state.VerticalScroller) {
      return null;
    }
    const { Text, playSound } = this.state;
    const Sounds = {
      message1: 'Message',
      deafen: 'Deafen',
      undeafen: 'Undeafen',
      mute: 'Mute',
      unmute: 'Unmute',
      disconnect: 'Voice Disconnected',
      ptt_start: 'PTT Activate',
      ptt_stop: 'PTT Deactivate',
      user_join: 'User Join',
      user_leave: 'User Leave',
      call_calling: 'Outgoing Ring',
      call_ringing: 'Incoming Ring',
      stream_started: 'Stream Started',
      stream_stopped: 'Stream Stopped',
      stream_user_joined: 'Viewer Join',
      stream_user_left: 'Viewer Leave',
      discodo: 'Discodo Easter Egg'
    };
    return (
      <this.state.VerticalScroller>
        {/* <h5 className='h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi marginBottom8-AtZOdT'>
          Notification Sounds
        </h5> */}
        <div className='description-3_Ncsb formText-3fs7AJ marginBottom20-32qID7 modeDefault-3a2Ph1 primary-jw0I4K'>
          Customize notification sounds. You can put a link to an MP3 file in the textbox, or leave it blank to play the default sound. Use the slider to adjust the volume(only works on custom sounds).
        </div>
        {Object.keys(Sounds)
          .map((sound) =>
            <div className='nf-notification-sounds' style={{ marginBottom: '16px' }}>
              <div style={{ float: 'left' }}>
                <Text className='title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN'>
                  <label className='title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN'>
                    {Sounds[sound]}
                  </label>
                </Text>
              </div>

              <div style={{ float: 'right',
                width: '70%' }}>
                <div className='nf-setting-value-container' style={{ float: 'left' }}>
                  <button onClick={() => {
                    if (!this.state.notifsounds[sound] || !this.state.notifsounds[sound].url) {
                      playSound(sound);
                      return;
                    }
                    if (this.state.playing[sound]) {
                      this.state.playing[sound].pause();
                      delete this.state.playing[sound];
                    } else {
                      // eslint-disable-next-line new-cap
                      const player = new Audio(this.state.notifsounds[sound].url);
                      player.volume = this.state.notifsounds[sound] ? this.state.notifsounds[sound].volume : 0.5;
                      player.play();
                      player.addEventListener('ended', (event) => {
                        delete this.state.playing[sound];
                      });
                      this.state.playing[sound] = player;
                    }
                  }} className='nf-notification-sounds-icon button-1Pkqso iconButton-eOTKg4 button-38aScr lookOutlined-3sRXeN colorWhite-rEQuAQ buttonSize-2Pmk-w iconButtonSize-U9SCYe grow-q77ONN'/>
                </div>
                <div className='nf-slider-container nf-setting-value-container' style={{ float: 'left',
                  width: '30%' }}>
                  <SliderInput
                    initialValue={this.state.notifsounds[sound] ? this.state.notifsounds[sound].volume * 100 : 50}
                    minValue={0}
                    maxValue={100}
                    className='nf-slider'
                    // onMarkerRender={marker => `${marker} ${Messages.SMART_TYPERS.USERS}`}
                    defaultValue={this.state.notifsounds[sound] ? this.state.notifsounds[sound].volume * 100 : 50}
                    onValueChange={(value) => {
                      if (!this.state.notifsounds[sound]) {
                        this.state.notifsounds[sound] = {};
                      }
                      this.state.notifsounds[sound].volume = value / 100;
                      this.props.updateSetting('notifsounds', this.state.notifsounds);
                    }}
                  ></SliderInput>
                </div>
                <div className='nf-setting-value-container' style={{ float: 'left' }}>
                  <TextInput
                    onChange={(value) => {
                      if (!this.state.notifsounds[sound]) {
                        this.state.notifsounds[sound] = {};
                      }
                      this.state.notifsounds[sound].url = value;
                      if (this.state.notifsounds[sound].url === '') {
                        delete this.state.notifsounds[sound];
                      }
                      this.props.updateSetting('notifsounds', this.state.notifsounds);
                    }}
                    className='nf-textarea-notifsounds'
                    style={{ height: '33px' }}
                    placeholder='Link to MP3 file'
                    defaultValue={this.state.notifsounds[sound] ? this.state.notifsounds[sound].url : ''}
                  />
                </div>
              </div>
            </div>
          )
        }
      </this.state.VerticalScroller>
    );
  }
};
