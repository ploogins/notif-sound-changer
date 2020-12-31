const { React } = require('powercord/webpack');
const { getModule, getModuleByDisplayName } = require('powercord/webpack');
const { TextInput, SliderInput } = require('powercord/components/settings');
const { Button, Text } = require('powercord/components');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    const get = props.getSetting;
    this.state = {
      notifsounds: get('notifsounds', {}),
      playing: {}
    };
  }

  async componentDidMount () {
    this.setState({
      VerticalScroller: (await getModule([ 'AdvancedScrollerThin' ])).AdvancedScrollerThin,
      playSound: (await getModule([ 'playSound' ])).playSound
    });
  }

  render () {
    console.log(this.state.notifsounds);
    if (!this.state.VerticalScroller) {
      return null;
    }
    const { VerticalScroller, playSound } = this.state;
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
      <VerticalScroller>
        {/* <h5 className='h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi marginBottom8-AtZOdT'>
          Notification Sounds
        </h5> */}
        <div className='description-3_Ncsb formText-3fs7AJ marginBottom20-32qID7 modeDefault-3a2Ph1 primary-jw0I4K'>
          Customize notification sounds. You can put a link to an MP3 file in the textbox, or leave it blank to play the default sound. Use the slider to adjust the volume(only works on custom sounds).
        </div>
        {Object.keys(Sounds)
          .map((sound) =>
            <div className='nf-notification-sounds'>
              <Text className='nf-sound-title title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN'>
                <label className='title-31JmR4 titleDefault-a8-ZSr medium-zmzTW- size16-14cGz5 height20-mO2eIN'>
                  {Sounds[sound]}
                </label>
              </Text>

              <div className='nf-setting-value-container'>
                <div className='nf-button-container nf-setting-value'>
                  <Button onClick={() => {
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
                      player.volume = this.state.notifsounds[sound] ? this.state.notifsounds[sound].volume || 0.5 : 0.5;
                      player.play();
                      player.addEventListener('ended', (event) => {
                        delete this.state.playing[sound];
                      });
                      this.state.playing[sound] = player;
                    }
                  }} className='nf-notification-sounds-icon'/>
                  <div className='divider-3573oO dividerDefault-3rvLe-'/>
                </div>
                <div className='nf-slider-container nf-setting-value'>
                  <SliderInput
                    initialValue={this.state.notifsounds[sound] ? (this.state.notifsounds[sound].volume || 0.5) * 100 : 50}
                    minValue={0}
                    maxValue={100}
                    className='nf-slider'
                    // onMarkerRender={marker => `${marker} ${Messages.SMART_TYPERS.USERS}`}
                    defaultValue={this.state.notifsounds[sound] ? (this.state.notifsounds[sound].volume || 0.5) * 100 : 50}
                    onValueChange={_.debounce((value) => {
                      if (!this.state.notifsounds[sound]) {
                        this.state.notifsounds[sound] = {};
                      }
                      this.state.notifsounds[sound].volume = value / 100;
                      this.props.updateSetting('notifsounds', this.state.notifsounds);
                    }, 500)}
                  ></SliderInput>
                </div>
                <div className='nf-setting-value'>
                  <TextInput
                    onChange={(value) => {
                      if (!this.state.notifsounds[sound]) {
                        this.state.notifsounds[sound] = {};
                      }
                      this.state.notifsounds[sound].url = value;
                      this.state.notifsounds[sound].volume = this.state.notifsounds[sound].volume || 0.5;
                      if (this.state.notifsounds[sound].url === '') {
                        delete this.state.notifsounds[sound];
                      }
                      this.props.updateSetting('notifsounds', this.state.notifsounds);
                    }}
                    className='nf-textarea-notifsounds'
                    placeholder='Link to MP3 file'
                    defaultValue={this.state.notifsounds[sound] ? this.state.notifsounds[sound].url : ''}
                  />
                </div>
              </div>
            </div>
          )
        }
      </VerticalScroller>
    );
  }
};
